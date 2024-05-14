# Kidneys
**Kidneys** is a Discord bot designed to dynamically display and update player rankings based on their nicknames within the dtox Discord servers.

## Purpose
On the dtox Discord servers, players have their skill levels indicated as a prefix in their nicknames, reflecting their proficiency in games like Counter-Strike. These rankings are manually assigned by moderators. Examples include:
- [2] Coin
- [2] NextageKL
- [7] brenosoft
- [7] calango

## Functionality
**Kidneys** monitors any changes in nicknames on the server and updates the rankings accordingly. When a nickname is updated, the bot automatically gathers this data and prints the complete ranking list in a user-friendly format. The rankings are displayed in a dedicated Discord channel, ensuring all members can easily see the current standings.

## Features
- **Real-time updates:** The bot responds immediately to changes in player nicknames, ensuring that the rankings are always current.
- **Automated sorting:** Players are sorted by rank, and their names are listed under each rank category.
- **Clean presentation:** The rankings are presented in a clear and organized manner, making it easy to see who is leading.

## Installation and Setup
To set up the Kidneys bot on your own Discord server, follow these steps:
1. Clone this repository to your local machine.
2. Install the necessary dependencies using `pip install -r requirements.txt`.
3. Set up your Discord bot token in the configuration file.
4. Run the bot using `./run.sh run`.

## Contributing
Contributions to Kidneys are welcome! If you have suggestions for improvements or have found a bug, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
