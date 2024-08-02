package main

import (
	"fmt"
	"github.com/rooklift/sgf"
)

/*
 * Creates new SGF struct
*/
type SgfMaker struct {
	node sgf.Node
}

/*
 * Place a black stone on the board
 * @param x X position of stone
 * @param y Y position of stone
*/
func (self *SgfMaker) PlaceBlackPiece(x int, y int) {
	self.node.AddValue("AB", sgf.Point(x, y))
}

/*
 * Place a white stone on the board
 * @param x X position of stone
 * @param y Y position of stone
*/
func (self *SgfMaker) PlaceWhitePiece(x int, y int) {
	self.node.AddValue("AW", sgf.Point(x, y))
}

/*
 * Skips the current turn
*/
func (self SgfMaker) PassTurn() {
	self.node.Pass()
}

/*
 * Creates a new board for the SGF node
 * @param size Size of the new board
*/
func (self *SgfMaker) NewBoard(size int) {
	self.node = *sgf.NewTree(size)
}

/*
 * Prints out the current board
*/
func (self SgfMaker) Print() {
	fmt.Println(self.node.SGF())
}

/*
 * Gets the SGF for the board
 * @return A string containing the entire SGF needed to create the board
*/
func (self SgfMaker) String() string {
	return self.node.SGF()
}

/*
 * Saves the current board for later
 * @return The location of the saved board
*/
func (self SgfMaker) Save(name string) error {
	self.node.MakeMainLine()
	return self.node.Save(name)
}
