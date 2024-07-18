package main

import (
	"bytes"
	"fmt"
	"log"
	"os/exec"
	"strings"
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
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}

	// filtering

	stringOut := strings.Split(string(out), "\n")
	for _, line := range stringOut {
		fmt.Println("Line: " + line)
	}
	return out
}
