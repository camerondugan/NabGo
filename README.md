# NabGo

[Our Official Demo at NabGo.us](https://nabgo.us)

NabGo is a web-based application to assist beginner-level players in enhancing their knowledge of the game of Go. Upon update, the main branch of this repository is automatically deployed to the domain nabgo.us via CloudFlare. Our GitHub repository is accessible via the following link: https://github.com/camerondugan/NabGo.

## Abstract
Go is one of the oldest board games in the world, with its history being traced back to ancient China. The goal is to capture as much territory on the board as possible by surrounding the opposing player’s stones. It is a game which has a fairly simple concept, but requires an immense amount of strategy to become a high level player. Because of this, it can be overwhelming for many beginners. For those who prefer playing on a physical board, it can be difficult to find the exact input they need for specific board states. With NabGo, we intend to provide a resource for these players to acquire the information they need to grow their knowledge and enjoyment of the game of Go.


NabGo offers a few primary features which allow the user to enhance their knowledge of Go. First is an object detection machine learning model which will allow for users to upload images of their physical game board and see it reproduced in digital form. The digital board can then be edited to account for any inaccuracies from the prediction. From there, there are two options for continuing the game. At any point, the user can copy the smart game format (SGF) for the digital board, which they can then use to upload their game to external Go websites, such as online-go.com, which has many resources for new players. On NabGo, players will also have access to analysis tools provided by the KataGo engine. When a player chooses to analyze the game board, they will be presented with statistics such as the current win probability and score for the game, as well as the three moves KataGo considers as the best for the next turn. This will allow users to have feedback for how to play in difficult situations, growing their understanding of the game. Finally, the user can interact with Gollama, a chat bot build utilizing Ollama. The user can ask Gollama questions about both the NabGo website and, more importantly, the game of Go itself. These features combine to create an environment where users can play Go while being provided with several resources for improving their gameplay.


## Breakdown of Folder Structure

The following is an explanation of the folder structure of the NabGo application, containing the major directories and their purposes.

### Backend

The back end directory contains the major components necessary for facilitating the flow of data through the layers of our project. It contains:

- Our Go server, which receives HTTP requests from the front end, executes them, and sends the results back to the user
- Go helper functions for completing the major functions of our product (analyis, image prediction, etc.)
- Our EdgeDB schema


### Chatbot

This directory contains the Modelfile for configuring our Gollama chat bot (implemented utilizing Meta Llama3 via Ollama).


### Documentation

This directory contains the necessary documentation for the submission of this project. This includes:

- Final design document
- Final presentation
- Final report covering all essential details for project as outlined in submission guidelines


### Machine Learning

This directory contains the necessary materials for the machine learning aspects of NabGo. This includes:

- Requirements text file for setting up a virtual Python environment for scripts to run on which contain the necessary libraries
- Python script for utilizing YOLOv8n model for object detection on a given image
- Python script for calling KataGo analysis engine for given board state


### Website

This directory contains the front end components of our project. This includes:

- Main HTML page
- Main CSS styling
- JavaScript file for rendering digital game board
- JavaScript file for essential front end functionality, primarily sending HTTP requests to back end and processing the results
