package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
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
	handleAuth(w, req, "http://localhost:10701/db/main/ext/auth/ui/signin")
}

func handleUiSignUp(w http.ResponseWriter, req *http.Request) {
	handleAuth(w, req, "http://localhost:10701/db/main/ext/auth/ui/signup")
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
	fatalErrCheck(err)
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())
	fmt.Println(tempFile.Name())
	//fill jpg file with image converted to jpg

	r.ParseMultipartForm(32 << 20) // limit your max input length!
	var buf bytes.Buffer
	// in your case file would be fileupload
	file, _, err := r.FormFile("file")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	// Copy the file data to my buffer
	_, err = io.Copy(&buf, file)
	fatalErrCheck(err)
	// do something with the contents...
	// I normally have a struct defined and unmarshal into a struct, but this will
	// work as an example
	// contents := buf.String()
	// fmt.Println(contents)

	_, err = tempFile.Write(buf.Bytes())
	fatalErrCheck(err)
	// Our main piece of code:
	predict(tempFile.Name())
	// etc write header
	json, err := os.Open(tempFile.Name() + ".json")
	fatalErrCheck(err)
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())
	if err == nil {
		buf.Reset()
		_, err := io.Copy(&buf, json)
		fatalErrCheck(err)
		fmt.Println(json.Name())
		_, err = w.Write(buf.Bytes())
		fatalErrCheck(err)
	} else {
		_, err = w.Write([]byte("python json error"))
		fatalErrCheck(err)
	}
}

func handleSgf(w http.ResponseWriter, req *http.Request) {
	enableCors(&w)
	var v [][]int // value from req
	err := json.NewDecoder(req.Body).Decode(&v)
	fatalErrCheck(err)
	// Generate SGF File
	sgfMaker := SgfMaker{}
	sgfMaker.NewBoard(len(v))
	for x := range v {
		for y, stone := range v[x] {
			if stone == -1 { //null
				continue
			} else if stone == 0 { //black
				sgfMaker.PlaceBlackPiece(x, y)
			} else { // white
				sgfMaker.PlaceWhitePiece(x, y)
			}
		}
	}
	_, err = w.Write([]byte(sgfMaker.String()))
	fatalErrCheck(err)
}

func handleAnalyze(w http.ResponseWriter, req *http.Request) {
	enableCors(&w)

	var v []string
	err := json.NewDecoder(req.Body).Decode(&v)
	fatalErrCheck(err)
	out := analyze(v[0], v[1])
	// etc write header
	_, err = w.Write([]byte(out))
	fatalErrCheck(err)
}

func runServer() {
	// set things to respond to
	//http.HandleFunc("/headers", headers)
	http.HandleFunc("/ui/signin", handleUiSignIn)
	http.HandleFunc("/ui/signup", handleUiSignUp)
	http.HandleFunc("/predict", handlePredict)
	http.HandleFunc("/sgf", handleSgf)
	http.HandleFunc("/analyze", handleAnalyze)

	// define a server and what address it listens to
	server := &http.Server{
		Addr:        ":8888",
		Handler:     nil,
		IdleTimeout: 15 * time.Minute,
	}

	fmt.Println("starting public server")
	err := server.ListenAndServe()
	fatalErrCheck(err)
}
