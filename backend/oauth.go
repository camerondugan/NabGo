package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

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
