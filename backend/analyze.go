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
	err := cmd.Run()
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}

	out, err := cmd.Output()
	fatalErrCheck(err)
	fmt.Printf("out: %v\n", out)
	return out
}
