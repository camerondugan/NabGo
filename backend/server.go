package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

func enableCors(w *http.ResponseWriter) {
	//(*w).Header().Set("Access-Control-Allow-Origin", "https://b.nabgo.us/predict")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

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

func handleUiSignIn(w http.ResponseWriter, req *http.Request) {
	handleAuth(w, req, "https://auth.nabgo.us/db/main/ext/auth/ui/signin")
}

func handleUiSignUp(w http.ResponseWriter, req *http.Request) {
	handleAuth(w, req, "https://auth.nabgo.us/db/main/ext/auth/ui/signup")
}

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
		if strings.HasPrefix("edgedb-pkce-verifier=", cookie.Name) {
			verifier = strings.Split(cookie.Name, "=")[1]
		}
	}
	if verifier == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	exchangeStr := "https://auth.nabgo.us/db/main/ext/auth/callback/"
	exchangeURL, err := url.Parse(exchangeStr)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	exchangeURL.Query().Add("code", code)
	exchangeURL.Query().Add("verifier", verifier)
	req2, err := http.Get(exchangeURL.String())
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusForbidden)
		return
	}
	if req2.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusTeapot)
		w.Write([]byte("Auth from server error"))
		return
	}

	fmt.Printf("req2: %v\n", req2.Body)
}

// func headers(w http.ResponseWriter, req *http.Request) {
// 	for name, headers := range req.Header {
// 		for _, h := range headers {
// 			fmt.Fprintf(w, "%v: %v\n", name, h)
// 		}
// 	}
// }

func handlePredict(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	tempFile, err := os.CreateTemp("", "predictionImage-*.jpg")
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())
	if err != nil {
		log.Println(err.Error())
	}
	fmt.Println(tempFile.Name())
	//fill jpg file with image converted to jpg

	r.ParseMultipartForm(32 << 20) // limit your max input length!
	var buf bytes.Buffer
	// in your case file would be fileupload
	file, _, err := r.FormFile("file")
	defer file.Close()
	if err != nil {
		log.Println(err.Error())
		return
	}
	// Copy the file data to my buffer
	_, err = io.Copy(&buf, file)
	if err != nil {
		log.Println(err.Error())
		return
	}
	// do something with the contents...
	// I normally have a struct defined and unmarshal into a struct, but this will
	// work as an example
	// contents := buf.String()
	// fmt.Println(contents)

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

func handleSgf(w http.ResponseWriter, req *http.Request) {
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

func handleAnalyze(w http.ResponseWriter, req *http.Request) {
	enableCors(&w)

	var v []string
	err := json.NewDecoder(req.Body).Decode(&v)
	if err != nil {
		log.Println(err.Error())
		return
	}
	out := analyze(v[0], v[1])
	// etc write header
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
