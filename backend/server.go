package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"time"

	"github.com/edgedb/edgedb-go"
)

type AuthJson struct {
	Auth_token             string
	Identity_id            string
	Provider_token         string
	Provider_refresh_token string
}

// Enable CORS
func enableCors(w *http.ResponseWriter) {
	//(*w).Header().Set("Access-Control-Allow-Origin", "https://b.nabgo.us/predict")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

// Handle user authentication
func handleAuth(w http.ResponseWriter, req *http.Request, redirect string) {
	verifier, challenge := generatePKCE()

	fmt.Println("Got an AUTH request")
	// setup challenge cookie
	cookie := http.Cookie{
		Name:    "edgedb-pkce-verifier",
		Value:   verifier,
		Expires: time.Now().Add(time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, &cookie)

	// setup validation url
	vals := url.Values{}
	vals.Set("challenge", challenge)
	// activate it
	http.Redirect(
		w,
		req,
		redirect+"?"+vals.Encode(),
		http.StatusSeeOther,
	)
}

// Handle user sign in
func handleUiSignIn(w http.ResponseWriter, req *http.Request) {
	handleAuth(w, req, "https://auth.nabgo.us/db/main/ext/auth/ui/signin")
}

// Handle user sign up
func handleUiSignUp(w http.ResponseWriter, req *http.Request) {
	handleAuth(w, req, "https://auth.nabgo.us/db/main/ext/auth/ui/signup")
}

// Send query to Gollama chat bot and write result back to user
func handleOllama(w http.ResponseWriter, req *http.Request) {
	enableCors(&w)
	b, err := io.ReadAll(req.Body)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	body := string(b)

	cmd := exec.Command(
		"ollama", "run", "gollama", body,
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		log.Println(stderr.String())
		log.Println(err.Error())
		return
	}
	_, err = w.Write(out)
	if err != nil {
		log.Println(stderr.String())
		log.Println(err.Error())
	}
}

func isLoggedIn(req *http.Request) bool {
	// Login verification handled on front end

	// for cookie := range req.Cookies() {
	// 	fmt.Printf("cookie: %v\n", cookie)
	// }
	// auth, err := req.Cookie("edgedb-auth-token")
	// if err != nil {
	// 	fmt.Println(err.Error())
	// 	return false
	// }
	// // if we didn't set this cookie
	// if !auth.Secure || auth.SameSite != http.SameSiteStrictMode {
	// 	fmt.Println("Cookie isn't what we set")
	// 	return false
	// }
	return true
}

type EdgedbUser struct {
	id       edgedb.OptionalUUID
	name     edgedb.OptionalStr
	identity string
}

// Verify user and set cookie
func handleUiVerify(w http.ResponseWriter, req *http.Request) {
	url := req.URL
	code := url.Query().Get("code")
	if code == "" {
		fmt.Println(url.Query().Get("error"))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	cookies := req.Cookies()
	verifier := ""
	for _, cookie := range cookies {
		if cookie.Name == "edgedb-pkce-verifier" {
			verifier = cookie.Value
		}
	}
	if verifier == "" {
		fmt.Println("Verifier was empty")
		w.WriteHeader(http.StatusNotFound)
		return
	}
	exchangeStr := "https://auth.nabgo.us/db/main/ext/auth/token"
	exchangeURL, err := url.Parse(exchangeStr)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	newQuery := exchangeURL.Query()
	newQuery.Add("code", code)
	newQuery.Add("verifier", verifier)
	req2, err := http.Get(exchangeURL.String() + "?" + newQuery.Encode())
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		fmt.Println("Can't make web request")
		return
	}

	if req2.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusNotAcceptable)
		w.Write([]byte("Auth from server error\n"))
		req2.Write(w)
		fmt.Println("Status wasn't ok")
		return
	}

	var aj AuthJson
	err = json.NewDecoder(req2.Body).Decode(&aj)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	// isSignUp := req.URL.Query().Has("isSignUp")
	isSignUp := true
	fmt.Println(req.URL.String() + "?" + req.URL.Query().Encode())
	if isSignUp {
		ctx := context.Background()
		client, err := edgedb.CreateClient(ctx, edgedb.Options{})
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		defer client.Close()

		var result EdgedbUser
		err = client.WithGlobals(map[string]interface{}{"ext::auth::client_token": aj.Auth_token}).
			QuerySingle(ctx, `
			insert User {
				identity := (global ext::auth::ClientTokenIdentity)
			};
		`, &result)
		if err != nil {
			fmt.Println(err.Error())
		}
		fmt.Println(result)
	}

	cookie := http.Cookie{
		Name:     "edgedb-auth-token",
		Value:    aj.Auth_token,
		Expires:  time.Now().Add(time.Hour * 24 * 5),
		Path:     "/",
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Domain:   ".nabgo.us",
	}
	http.SetCookie(w, &cookie)

	// head on back to main site
	http.Redirect(
		w,
		req,
		"https://nabgo.us",
		http.StatusSeeOther,
	)
}

// func headers(w http.ResponseWriter, req *http.Request) {
// 	for name, headers := range req.Header {
// 		for _, h := range headers {
// 			fmt.Fprintf(w, "%v: %v\n", name, h)
// 		}
// 	}
// }

// Handle prediction request
func handlePredict(w http.ResponseWriter, r *http.Request) {
	if !isLoggedIn(r) {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	enableCors(&w)
	tempFile, err := os.CreateTemp("", "predictionImage-*.jpg")
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())
	if err != nil {
		log.Println(err.Error())
	}
	fmt.Println(tempFile.Name())

	r.ParseMultipartForm(32 << 20)
	var buf bytes.Buffer

	file, _, err := r.FormFile("file")
	defer file.Close()
	if err != nil {
		log.Println(err.Error())
		return
	}
	// Copy the file data to buffer
	_, err = io.Copy(&buf, file)
	if err != nil {
		log.Println(err.Error())
		return
	}

	_, err = tempFile.Write(buf.Bytes())
	if err != nil {
		log.Println(err.Error())
		return
	}
	// Our main piece of code:
	predict(tempFile.Name())
	// etc write header
	json, err := os.Open(tempFile.Name() + ".json")
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())
	if err != nil {
		log.Println(err.Error())
		return
	}
	if err == nil {
		buf.Reset()
		_, err := io.Copy(&buf, json)
		if err != nil {
			log.Println(err.Error())
			return
		}
		fmt.Println(json.Name())
		_, err = w.Write(buf.Bytes())
		if err != nil {
			log.Println(err.Error())
			return
		}
	} else {
		_, err = w.Write([]byte("python json error"))
		if err != nil {
			log.Println(err.Error())
			return
		}
	}
}

// Handle SGF request
func handleSgf(w http.ResponseWriter, req *http.Request) {
	if !isLoggedIn(req) {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	enableCors(&w)
	var v [][]int // value from req
	err := json.NewDecoder(req.Body).Decode(&v)
	if err != nil {
		log.Println(err.Error())
		return
	}
	// Generate SGF File
	sgfMaker := SgfMaker{}
	sgfMaker.NewBoard(len(v))
	for x := range v {
		for y, stone := range v[x] {
			if stone == -1 { //null
				continue
			} else if stone == 0 { //black
				sgfMaker.PlaceBlackPiece(x, 18-y)
			} else { // white
				sgfMaker.PlaceWhitePiece(x, 18-y)
			}
		}
	}
	_, err = w.Write([]byte(sgfMaker.String()))
	if err != nil {
		log.Println(err.Error())
		return
	}
}

// Handle analysis request
func handleAnalyze(w http.ResponseWriter, req *http.Request) {
	if !isLoggedIn(req) {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	enableCors(&w)

	var v []string
	err := json.NewDecoder(req.Body).Decode(&v)
	if err != nil {
		log.Println(err.Error())
		return
	}
	out := analyze(v[0], v[1])

	_, err = w.Write([]byte(out))
	if err != nil {
		log.Println(err.Error())
		return
	}
}

type removeStoneJson struct {
	LastMove []int
	Stones   [][]Stone
}

func handleRemoveStones(w http.ResponseWriter, req *http.Request) {
	if !isLoggedIn(req) {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	enableCors(&w)

	var v removeStoneJson
	err := json.NewDecoder(req.Body).Decode(&v)
	if err != nil {
		log.Println(err.Error())
		return
	}

	encoder := json.NewEncoder(w)
	err = encoder.Encode(removeStones(v.LastMove, v.Stones))
	if err != nil {
		log.Println(err.Error())
		return
	}
}

// Run Go server
func runServer() {
	// set things to respond to
	//http.HandleFunc("/headers", headers)
	http.HandleFunc("/ui/signin", handleUiSignIn)
	http.HandleFunc("/ui/signup", handleUiSignUp)
	http.HandleFunc("/ui/verify", handleUiVerify)
	http.HandleFunc("/predict", handlePredict)
	http.HandleFunc("/sgf", handleSgf)
	http.HandleFunc("/analyze", handleAnalyze)
	http.HandleFunc("/removeStones", handleRemoveStones)
	http.HandleFunc("/ollama", handleOllama)

	// define a server and what address it listens to
	server := &http.Server{
		Addr:        ":8888",
		Handler:     nil,
		IdleTimeout: 15 * time.Minute,
	}

	fmt.Println("starting public server")
	for { // attempt to continue even if exit
		err := server.ListenAndServe()
		if err != nil {
			log.Println(err.Error())
		}
	}
}
