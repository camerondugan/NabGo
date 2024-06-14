package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "https://nabgo.us")
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
	io.Copy(&buf, file)
	// do something with the contents...
	// I normally have a struct defined and unmarshal into a struct, but this will
	// work as an example
	contents := buf.String()
	fmt.Println(contents)
	// I reset the buffer in case I want to use it again
	// reduces memory allocations in more intense projects
	buf.Reset()
	// do something else
	// etc write header
	predict()
	w.Write([]byte("done"))
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

	fmt.Print("starting server")
	err := server.ListenAndServe()
	fatalErrCheck(err)
}
