package main

import (
	"context"
	"fmt"
	"log"

	"github.com/edgedb/edgedb-go"
)

func fatalErrCheck(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	ctx := context.Background()
	client, err := edgedb.CreateClient(ctx, edgedb.Options{})
	fatalErrCheck(err)
	defer client.Close()
	fmt.Println("main")
	runServer()
}
