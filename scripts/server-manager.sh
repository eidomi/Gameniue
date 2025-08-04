#!/bin/bash
# server-manager.sh - Utility for managing local development server
# Created: $(date +"%Y-%m-%dT%H:%M:%S.%6N")

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Gameniue Server Manager${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Find an available port
function find_available_port() {
    local port=$1
    while [ $(lsof -i:$port -t | wc -l) -gt 0 ]; do
        echo -e "${YELLOW}Port $port is in use, trying next port...${NC}"
        port=$((port + 1))
    done
    echo $port
}

# Kill process on port
function kill_port() {
    local port=$1
    local pid=$(lsof -i:$port -t)
    
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}No process found on port $port${NC}"
        return 1
    fi
    
    echo -e "${RED}Killing process $pid on port $port${NC}"
    kill -9 $pid
    echo -e "${GREEN}Process terminated successfully${NC}"
}

# Start server with port check
function start_server() {
    local port=$1
    local available_port=$(find_available_port $port)
    
    if [ "$available_port" -ne "$port" ]; then
        echo -e "${YELLOW}Port $port is in use. Would you like to:${NC}"
        echo -e "${BLUE}1) Use port $available_port instead${NC}"
        echo -e "${BLUE}2) Kill the process on port $port and use it${NC}"
        echo -e "${BLUE}3) Exit${NC}"
        read -p "Select option (1-3): " option
        
        case $option in
            1)
                port=$available_port
                ;;
            2)
                kill_port $port
                if [ $? -ne 0 ]; then
                    echo -e "${RED}Failed to kill process on port $port${NC}"
                    exit 1
                fi
                ;;
            3)
                echo -e "${BLUE}Exiting...${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Exiting...${NC}"
                exit 1
                ;;
        esac
    fi
    
    echo -e "${GREEN}Starting HTTP server on port $port...${NC}"
    echo -e "${BLUE}Access your games at: http://localhost:$port/${NC}"
    python3 -m http.server $port
}

# List all running servers
function list_servers() {
    echo -e "${BLUE}Currently running HTTP servers:${NC}"
    lsof -i -P | grep LISTEN | grep python
    echo ""
}

# Parse arguments
case "$1" in
    start)
        port=${2:-8000}
        start_server $port
        ;;
    kill)
        port=${2:-8000}
        kill_port $port
        ;;
    list)
        list_servers
        ;;
    *)
        echo -e "${BLUE}Usage:${NC}"
        echo -e "  $0 start [port]  - Start HTTP server (default port: 8000)"
        echo -e "  $0 kill [port]   - Kill process on port (default: 8000)"
        echo -e "  $0 list          - List all running HTTP servers"
        ;;
esac
