# ProtonVPN Repo Update Notifier Bot

This is a simple Discord bot that monitors the ProtonVPN unstable repository for changes and sends notifications to Discord when updates are detected

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A Discord Bot Token ([How to create a Discord bot & get a token](https://discordjs.guide/preparations/setting-up-a-bot-application.html))
- The ID of the Discord channel where you want notifications sent.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/0xGingi/protonvpn-linux-notifier-discord
    cd protonvpn-linux-notifier-discord
    ```

2.  **Create a `.env` file:**
    Create a file named `.env` in the project root and add your Discord bot token and channel ID:
    ```env
    DISCORD_TOKEN=your_bot_token_here
    CHANNEL_ID=your_discord_channel_id_here
    ```

3.  **Create an empty state file:**
    This file is used to store the last known state of the repository index.
    ```bash
    touch state.json
    ```

## Running the Bot

Use Docker Compose to build and run the bot in the background:

```bash
docker compose up -d --build
```