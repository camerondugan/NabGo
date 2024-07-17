package main

import (
	"bytes"
	"fmt"
	"log"
	"os/exec"
)

func analyze(initial string, moves string) []byte {
	fmt.Println(initial)
	fmt.Println(moves)
	cmd := exec.Command(
		"../machine-learning/env/bin/python3", "../machine-learning/analysis.py",
		"--initial-stones", initial, "--moves", moves,
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	fmt.Println(out)
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}
	return out
}
