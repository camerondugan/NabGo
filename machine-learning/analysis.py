"""
This is a simple python program that demonstrates how to run KataGo's
analysis engine as a subprocess and send it a query. It queries the
result of playing the 4-4 point on an empty board and prints out
the json response.
"""

import argparse
import ast
import json
import subprocess
import time
from threading import Thread
from typing import Any, Dict, List, Literal, Optional, Tuple, Union

import sgfmill
import sgfmill.ascii_boards
import sgfmill.boards

Color = Union[Literal["b"], Literal["w"]]
Move = Union[None, Literal["pass"], Tuple[int, int]]


def sgfmill_to_str(move: Move) -> str:
    if move is None:
        return "pass"
    if move == "pass":
        return "pass"
    (y, x) = move
    return "ABCDEFGHJKLMNOPQRSTUVWXYZ"[x] + str(y + 1)


class KataGo:

    def __init__(
        self,
        katago_path: str,
        config_path: str,
        model_path: str,
        additional_args: List[str] = [],
    ):
        self.query_counter = 0
        katago = subprocess.Popen(
            [
                katago_path,
                "analysis",
                "-config",
                config_path,
                "-model",
                model_path,
                *additional_args,
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self.katago = katago

        def printforever():
            while katago.poll() is None:
                data = katago.stderr.readline()
                time.sleep(0)
                if data:
                    print("KataGo: ", data.decode(), end="")
            data = katago.stderr.read()
            if data:
                print("KataGo: ", data.decode(), end="")

        self.stderrthread = Thread(target=printforever)
        self.stderrthread.start()

    def close(self):
        self.katago.stdin.close()

    def query(
        self,
        initial_board: sgfmill.boards.Board,
        initial_stones,
        moves: List[Tuple[Color, Move]],
        komi: float,
        max_visits=None,
    ):
        query = {}

        query["id"] = str(self.query_counter)
        self.query_counter += 1

         query["moves"] = [(color, sgfmill_to_str(move)) for color, move in moves]
         query["initialStones"] = [(color, sgfmill_to_str(move)) for color, move in initial_stones]
        # query["moves"] = moves
        # query["initialStones"] = initial_stones
        """for y in range(initial_board.side):
            for x in range(initial_board.side):
                color = initial_board.get(y,x)
                if color:
                    query["initialStones"].append((color,sgfmill_to_str((y,x))))"""
        query["rules"] = "tromp-taylor"
        query["komi"] = komi
        query["boardXSize"] = initial_board.side
        query["boardYSize"] = initial_board.side
        query["includePolicy"] = True
        if max_visits is not None:
            query["maxVisits"] = max_visits
        return self.query_raw(query)

    def query_raw(self, query: Dict[str, Any]):
        self.katago.stdin.write((json.dumps(query) + "\n").encode())
        self.katago.stdin.flush()

        # print(json.dumps(query))

        line = ""
        while line == "":
            if self.katago.poll():
                time.sleep(1)
                raise Exception("Unexpected katago exit")
            line = self.katago.stdout.readline()
            line = line.decode().strip()
            # print("Got: " + line)
        response = json.loads(line)

        # print(response)
        return response


if __name__ == "__main__":
    description = """
    Example script showing how to run KataGo analysis engine and query it from python.
    """
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument(
        "--initial-stones",
        help="Initial stones on the board",
        required=True,
    )
    parser.add_argument(
        "--moves",
        help="Moves since upload",
        required=True,
    )

    args = parser.parse_args()
    print(args)

    board = sgfmill.boards.Board(19)
    komi = 6.5
    initial_stones = json.loads(args.initial_stones)
    moves = json.loads(args.moves)

    # for i in range(len(initial_stones)):
    #     initial_stones[i] = tuple(map(str, initial_stones[i]))
    #
    # for i in range(len(moves)):
    #     moves[i] = tuple(map(str, moves[i]))

    print(initial_stones[0])
    print(type(initial_stones[0]))


    moves = [
        (
            (move[0], tuple(map(int, move[1].split(","))))
            if isinstance(move[1], str)
            else move
        )
        for move in moves
    ]
    initial_stones = [
        (
            (move[0], tuple(map(int, move[1].split(","))))
            if isinstance(move[1], str)
            else move
        )
        for move in initial_stones
    ]

    # displayboard = board.copy()
    # for color, move in initial_stones:
    #     if move != "pass":
    #         print(move)
    #         row, col = move
    #         displayboard.play(row, col, color)
    # for color, move in moves:
    #     if move != "pass":
    #         print(move)
    #         row, col = move
    #         displayboard.play(row, col, color)
    # print(sgfmill.ascii_boards.render_board(displayboard))

    print("Query result: ")
    katago = KataGo(
        "../../Katago/katago",
        "../../Katago/analysis_example.cfg",
        "../../Katago/kata1-b28c512nbt-s7168446720-d4316919285.bin.gz",
    )
    out = katago.query(board, initial_stones, moves, komi)
    print(json.dumps(out))

    katago.close()
