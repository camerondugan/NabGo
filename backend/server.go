package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "https://nabgo.us")
	//(*w).Header().Set("Access-Control-Allow-Origin", "*")
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

func hello(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "hello\n")
}

func headers(w http.ResponseWriter, req *http.Request) {
	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

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
	file, header, err := r.FormFile("file")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	name := strings.Split(header.Filename, ".")
	fmt.Printf("File name %s\n", name[0])
	// Copy the file data to my buffer
	_, err = io.Copy(&buf, file)
	fatalErrCheck(err)
	// do something with the contents...
	// I normally have a struct defined and unmarshal into a struct, but this will
	// work as an example
	contents := buf.String()
	fmt.Println(contents)

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
		_, err = w.Write(buf.Bytes())
		fatalErrCheck(err)
	} else {
		_, err = w.Write([]byte("python json error"))
		fatalErrCheck(err)
	}
}

func runServer() {
	// set things to respond to
	http.HandleFunc("/hello", hello)
	http.HandleFunc("/headers", headers)
	http.HandleFunc("/ui/signin", handleUiSignIn)
	http.HandleFunc("/ui/signup", handleUiSignUp)
	http.HandleFunc("/predict", handlePredict)
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
