package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"log"
)

func generatePKCE() (string, string) {
	// create verifier
	token := make([]byte, 32)
	_, err := rand.Read(token)
	if err != nil {
		log.Println(err.Error())
		return "", "" //avoid crashing
	}
	verifier := base64.RawURLEncoding.EncodeToString(token)

	// // debug
	// fmt.Println(verifier)
	// fmt.Println(len(verifier))

	// create challenge hash
	hasher := sha256.New()
	_, err = hasher.Write([]byte(verifier))
	if err != nil {
		log.Println(err.Error())
		return verifier, "" //avoid crashing
	}
	challenge := base64.RawURLEncoding.EncodeToString(hasher.Sum(nil))

	// // debug
	// fmt.Println(challenge)
	// fmt.Println(len(challenge))

	return verifier, challenge
}
