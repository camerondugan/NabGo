package sgfTools

import (
	"fmt"
	//"log"
	"github.com/rooklift/sgf"
)

type SgfMaker struct {
	board sgf.Node
}

func (self SgfMaker) PlayBlackPiece(x int, y int) {
	self.board.AddValue("AB", sgf.Point(x, y))
}

func (self SgfMaker) PlayWhitePiece(x int, y int) {
	self.board.AddValue("AW", sgf.Point(x, y))
}

func (self SgfMaker) PassTurn() {
	self.board.Pass()
}

func (self SgfMaker) ResetBoard() {
	self.board = *sgf.NewTree(self.board.Board().Size)
}

func (self SgfMaker) Print() {
	fmt.Println(self.board.SGF())
}

func (self SgfMaker) Save() {
	self.board.Save("board.sgf")
}
