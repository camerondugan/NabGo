package main

import (
	"context"
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
	// success!! we connected to edgedb!!
	// let's test login the user
	auth()
	runServer()
}
