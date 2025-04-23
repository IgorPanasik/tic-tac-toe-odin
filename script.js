const Gameboard = (() => {
	const board = Array(9).fill(null);

	const conditionsWin = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	const getBoard = () => board;

	const setCell = (index, marker) => {
		if (board[index] === null) {
			board[index] = marker;
			return true;
		}
		return false;
	};

	const checkWinner = () => {
		for (const [a, b, c] of conditionsWin) {
			if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
				return board[a];
			}
		}

		return board.every((cell) => cell !== null) ? 'tie' : null;
	};

	const getWinningCombo = () => {
		for (const [a, b, c] of conditionsWin) {
			if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
				return [a, b, c];
			}
		}
		return null;
	};

	const resetBoard = () => board.fill(null);

	return { getBoard, setCell, resetBoard, checkWinner, getWinningCombo };
})();

const GameController = (() => {
	let players = [];
	let activePlayer = null;
	let gameOver = false;

	const initGame = () => {
		const playerOne = document
			.querySelector('#player-one')
			.value.trim()
			.replace(/\s{2,}/g, ' ');

		const playerTwo = document
			.querySelector('#player-two')
			.value.trim()
			.replace(/\s{2,}/g, ' ');

		players = [
			{ name: playerOne || 'Player #One', marker: 'X' },
			{ name: playerTwo || 'Player #Two', marker: 'O' },
		];

		activePlayer = players[0];
		gameOver = false;
		Gameboard.resetBoard();
	};

	const setPlayerName = (i, name) => {
		if (players[i]) players[i].name = name || players[i].name;
	};

	const getActivePlayer = () => activePlayer;

	const playRound = (index) => {
		if (gameOver) return null;

		const success = Gameboard.setCell(index, activePlayer.marker);
		if (!success) return null;

		const result = Gameboard.checkWinner();
		if (result) {
			gameOver = true;
			return result;
		}

		activePlayer = activePlayer === players[0] ? players[1] : players[0];
		return null;
	};

	return { initGame, playRound, getActivePlayer, setPlayerName };
})();

const ScreenController = (() => {
	const gameBoardContainer = document.querySelector('.dashboard');
	const playerTurnParagraph = document.querySelector('.player-turn');
	const finallyMessageParagraph = document.querySelector('.show-message');
	const resetButton = document.querySelector('.reset-game');
	const inputOne = document.querySelector('#player-one');
	const inputTwo = document.querySelector('#player-two');

	const createButtonsOnBoard = () => {
		gameBoardContainer.textContent = '';

		for (let i = 0; i < 9; i++) {
			const btn = document.createElement('button');
			btn.classList.add('cell');
			btn.dataset.index = i;
			btn.textContent = '';
			gameBoardContainer.appendChild(btn);
		}
	};

	const updateScreen = () => {
		Gameboard.getBoard().forEach((cell, i) => {
			gameBoardContainer.children[i].textContent = cell || '';
		});
		const { name, marker } = GameController.getActivePlayer();
		playerTurnParagraph.textContent = `👉 ${name}'s turn (${marker})`;
	};

	const clickHandlerBoard = (e) => {
		const selectedCellBtnIndex = e.target.dataset.index;

		if (selectedCellBtnIndex === null) return;

		const result = GameController.playRound(+selectedCellBtnIndex);
		updateScreen();

		if (result && result !== 'tie') {
			const combo = Gameboard.getWinningCombo();

			combo.forEach((i) => {
				const btn = gameBoardContainer.querySelector(
					`.cell[data-index="${i}"]`,
				);
				btn.classList.add('winning');
			});

			gameBoardContainer
				.querySelectorAll('.cell')
				.forEach((btn) => (btn.disabled = true));

			finallyMessageParagraph.textContent = `${
				GameController.getActivePlayer().name
			} Won! 🎉🎉`;
		} else if (result === 'tie') {
			gameBoardContainer
				.querySelectorAll('.cell')
				.forEach((btn) => (btn.disabled = true));
			finallyMessageParagraph.textContent = 'It’s a tie – friendship wins! 😊';
		}
	};

	inputOne.addEventListener('input', (e) => {
		GameController.setPlayerName(0, e.target.value.trim());
		updateScreen();
	});

	inputTwo.addEventListener('input', (e) => {
		GameController.setPlayerName(1, e.target.value.trim());
		updateScreen();
	});

	const startGame = () => {
		GameController.initGame();
		finallyMessageParagraph.textContent = '';
		createButtonsOnBoard();
		updateScreen();
	};

	gameBoardContainer.addEventListener('click', clickHandlerBoard);
	resetButton.addEventListener('click', startGame);
	startGame();
	inputOne.focus();
})();
