package main

import (
	"bytes"
	"fmt"
	"log"
	"os/exec"
	"strings"
)

/**
 * Execute Python script to analyze game and write result
 * @param initial Initial stones
 * @param moves Move(s) made
 * @return Analysis data
 */
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
		log.Println(err.Error())
		return []byte{}
	}

	// filtering
	stringOut := strings.Split(string(out), "\n")
	for _, line := range stringOut {
		if line[0] == '{' {
			return []byte(line)
		}
	}

	var noBytes []byte
	return noBytes
}
