package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

const ServerPort = 3000

// Our main function
func auth() {
	// EDGEDB_AUTH_BASE_URL := os.Getenv("EDGEDB_AUTH_BASE_URL")
	generatePKCE()
}

func generatePKCE() (string, string) {
	// create verifier
	token := make([]byte, 32)
	_, err := rand.Read(token)
	fatalErrCheck(err)
	verifier := base64.URLEncoding.EncodeToString(token)

	// debug
	fmt.Println(verifier)
	fmt.Println(len(verifier))

	// create challenge hash
	hasher := sha256.New()
	hasher.Write([]byte(verifier))
	challenge := base64.URLEncoding.EncodeToString(hasher.Sum(nil))

	// debug
	fmt.Println(challenge)
	fmt.Println(len(challenge))

	return verifier, challenge
}
