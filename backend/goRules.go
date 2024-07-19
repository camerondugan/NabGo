package main

type Stone int

const ( // must define to align with the js
	Empty Stone = -1
	Black Stone = 0
	White Stone = 1
)

func removeStones(lastMove []int, stones [][]Stone) [][]int {
	if len(lastMove) == 0 || len(stones) == 0 || len(stones[0]) == 0 {
		return nil
	}
	// make white stones 1, not their variation
	for i := range stones {
		for j := range stones[i] {
			stones[i][j] = min(1, stones[i][j])
		}
	}
	// fmt.Printf("lastMove: %v\n", lastMove)
	var toRemove [][]int
	adjs := [][]int{{0, 1}, {1, 0}, {-1, 0}, {0, -1}}
	for _, adj := range adjs {
		pos := []int{adj[0] + lastMove[0], adj[1] + lastMove[1]}
		if outOfBounds(pos, stones) {
			// fmt.Println("OOB")
			continue
		}
		color := stones[pos[0]][pos[1]]
		noLiberties := withNoLiberties(color, pos, stones)
		// fmt.Printf("noLiberties: %v\n", noLiberties)
		toRemove = append(toRemove, noLiberties...)
	}
	// log.Println(toRemove)
	return toRemove
}

func withNoLiberties(color Stone, position []int, stones [][]Stone) [][]int {
	if color == Empty {
		return [][]int{}
	}
	// fmt.Printf("color: %v\n", color)
	adjs := [][]int{{0, 1}, {1, 0}, {-1, 0}, {0, -1}}
	stonesToRemove := [][]int{position}
	checkLocs := [][]int{}
	checkLocs = append(checkLocs, position)
	// while new adj are discovered
	for len(checkLocs) != 0 {
		// fmt.Printf("checkLocs: %v\n", checkLocs)
		// find liberties
		newCheckLocs := [][]int{}
		for _, loc := range checkLocs {
			for _, adj := range adjs {
				// check adj
				pos := []int{adj[0] + loc[0], adj[1] + loc[1]}
				// fmt.Printf("pos: %v\n", pos)
				// avoid oob
				if outOfBounds(pos, stones) {
					continue
				}
				stoneColor := stones[pos[0]][pos[1]]
				// fmt.Printf("stoneColor: %v\n", stoneColor)
				if stoneColor == Empty {
					// println("Found a liberty")
					return [][]int{} // all stones found so far have a liberty
				} else if stones[pos[0]][pos[1]] == color {
					if !exists(pos, stonesToRemove) {
						newCheckLocs = append(newCheckLocs, pos)
						stonesToRemove = append(stonesToRemove, pos)
					}
				}
			}
		}
		// fmt.Printf("newCheckLocs: %v\n", newCheckLocs)
		checkLocs = make([][]int, len(newCheckLocs))
		copy(checkLocs, newCheckLocs)
	}
	// log.Println(stonesToRemove)
	return stonesToRemove
}

// checks if a pos var is off of the board
func outOfBounds(pos []int, stones [][]Stone) bool {
	return pos[0] >= len(stones) || pos[1] >= len(stones[0]) || pos[0] < 0 || pos[1] < 0
}

func exists(pos []int, stones [][]int) bool {
	for i := range stones {
		if stones[i][0] == pos[0] && stones[i][1] == pos[1] {
			return true
		}
	}
	return false
}
