package main

import (
	"fmt"
	"log"
)

func fatalErrCheck(err error) {
	if err != nil {
		log.Fatal(err.Error())
	}
}

func main() {
	//ctx := context.Background()
	//client, err := edgedb.CreateClient(ctx, edgedb.Options{})
	//fatalErrCheck(err)
	//defer client.Close()
	fmt.Println("main")
	//getPredictResults("")
	runServer()
	// runPredictionServer()
}
