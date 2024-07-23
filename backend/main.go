package main

import (
	"fmt"
)

func main() {
	//ctx := context.Background()
	//client, err := edgedb.CreateClient(ctx, edgedb.Options{})
	//defer client.Close()
	fmt.Println("main")
	//getPredictResults("")
	runServer()
	// runPredictionServer()
}
