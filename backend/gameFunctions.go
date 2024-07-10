package main

import (
	"fmt"
	//"log"
	"github.com/rooklift/sgf"
)

func PlayBlackPiece(x int, y int, board sgf.Node) {
	board.AddValue("AB", sgf.Point(x, y))
}

func PlayWhitePiece(x int, y int, board sgf.Node) {
	board.AddValue("AW", sgf.Point(x, y))
}

func PassTurn(board sgf.Node) {
	board.Pass()
}

func ResetBoard(board sgf.Node) {
	board = *sgf.NewTree(board.Board().Size)
}

func Print(board sgf.Node) {
	fmt.Println(board.SGF())
}

func Save(board sgf.Node) {
	board.Save("board.sgf")
}
