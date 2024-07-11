package sgfTools

import (
	"fmt"

	//"log"
	"github.com/rooklift/sgf"
)

type SgfMaker struct {
	node sgf.Node
}

func (self *SgfMaker) PlaceBlackPiece(x int, y int) {
	self.node.AddValue("AB", sgf.Point(x, y))
}

func (self *SgfMaker) PlaceWhitePiece(x int, y int) {
	self.node.AddValue("AW", sgf.Point(x, y))
}

func (self SgfMaker) PassTurn() {
	self.node.Pass()
}

func (self *SgfMaker) NewBoard(size int) {
	self.node = *sgf.NewTree(size)
}

func (self SgfMaker) Print() {
	fmt.Println(self.node.SGF())
}

func (self SgfMaker) String() string {
	return self.node.SGF()
}

func (self SgfMaker) Save(name string) error {
	self.node.MakeMainLine()
	return self.node.Save(name)
}
