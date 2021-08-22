import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

function calculateMove(size, squares, index){
  var nearby = 0;
  var leftEdge = index % size === 0;
  var rightEdge = index % size === size-1;
  var topEdge = index >=0 && index < size;
  var bottomEdge = index >= size * (size-1) && index < size*size;
  if (squares[index] === 'X'){
    return -1;
  }
  if (!leftEdge){
    if (squares[index-1] === 'X'){
      nearby ++;
    }
    if (!topEdge && squares[index-1-size] === 'X'){
      nearby ++;
    }
    if (!bottomEdge && squares[index-1+size] === 'X'){
      nearby ++;
    }
  }
  if (!rightEdge){
    if (squares[index+1] === 'X'){
      nearby ++;
    }
    if (!topEdge && squares[index+1-size] === 'X'){
      nearby ++;
    }
    if (!bottomEdge && squares[index+1+size] === 'X'){
      nearby ++;
    }
  }
  if (!topEdge && squares[index-size] === 'X'){
    nearby ++;
  }
  if (!bottomEdge && squares[index+size] === 'X'){
    nearby ++;
  }
  return nearby;
}


function distributeMines(size, num){
  var mineLocations = new Set();
  var grid =  Array(size*size);
  var minesLeft = num;
  while (minesLeft !== 0){
    var loc = parseInt(Math.random()*size*size);
    if (!mineLocations.has(loc)){
      mineLocations.add(loc);
      minesLeft --; 
      grid[loc] = 'X';
    }
  }
  return grid;
}


function Square(props) {
  return (
  <button className="square" onClick={props.onClick} onContextMenu={props.onContextMenu}> 
      {props.value}
  </button>
  );
}


class Board extends React.Component {
  constructor(props){
    super(props);
    var size = 20
    var mines = 75;
    const grid = distributeMines(size,mines);
    this.state={
      size : size,
      mineLocations: grid,
      lost: false,
      board: Array(size*size),
      minesLeft:mines,
      title: "Medium",
    };
  }
  renderSquare(i,v) {
      return (
          <Square 
          value = {v}
          onClick = {() => this.onClick(i, true, this.state.board.slice(), new Set())}
          onContextMenu = {(e) => { this.onContextMenu(i,e)}}
          />
      );
  }

  onContextMenu(i,e){
    var board = this.state.board.slice();
    var minesLeft = this.state.minesLeft;
    if (!this.state.lost){
      if (board[i] === undefined && minesLeft > 0){
        board[i] = "M";
        this.setState({board:board, minesLeft: minesLeft-1});
      }else if (board[i] === "M"){
        board[i] = undefined;
        this.setState({board:board, minesLeft: minesLeft+1});
      }
      console.log(board[i]);
    }
    e.preventDefault();
  }

  onClick(i, original, passedBoard, past){
    var board = passedBoard;
    if (!this.state.lost && board[i] === undefined){
      const size = this.state.size;
      var result = calculateMove(size,this.state.mineLocations,i);
      if (result === -1 && original){
        board[i] = 'X';
        this.setState({lost: true, board:board});
      }else{
        if (result ===0){
          if (!past.has(i-1) && i%size>0){
            past.add(i-1);
            this.onClick(i-1, false, board, past);
          }
          if (!past.has(i+1) && i%size <size-1){
            past.add(i+1);
            this.onClick(i+1, false, board, past);
          }
          if (!past.has(i-size) && i-size>=0){
            past.add(i-size);
            this.onClick(i-size, false, board, past);
          }
          if (!past.has(i+size) && (i/size)<size-1){
            past.add(i+size);
            this.onClick(i+size, false, board, past);
          }
        }
        board[i] = result;
        
        this.setState({board:board});
      }
    }
  }

  showMines(){
    var mines = this.state.mineLocations;
    var board = this.state.board.slice();
    for(let i = 0; i < board.length; i++){
      if (mines[i] === 'X'){
        board[i] = 'X';
      }
    }
    this.setState({board:board});
  }

  switchGameMode(size, mines, title){
    const grid = distributeMines(size,mines); 
    this.setState({title: title, lost:false, size:size, minesLeft:mines, mineLocations:grid, board:Array(size*size)})

  }

  render() {
    const board = this.state.board.slice();
    const size = this.state.size;
    const minesLeft = "Mines Left: " + this.state.minesLeft;
    var gameOver;
    if (this.state.lost){
      gameOver = "oops you hit a mine. game over :(";
    }
    var grid = [];
    var filledSquares = 0;
    for (let i= 0; i<size; i++){
      var row = [];
      for(let j = 0; j<size; j++){
        let info = board[i*size +j];
        if (info !== undefined){
          filledSquares ++;
        }
        row.push(this.renderSquare(i*size+j, info));          
      }
      grid.push(<div className="board-row">
      {row}
    </div>);
    }
    if (filledSquares === board.length && !this.state.lost){
      gameOver = "CONGRATS! you won :D"
    }
      return (
      <>
      <div className="title">Minesweeper built w/ React</div>
      <div className="bottom">created by Adam Wang</div>

      <p>Directions: The numbers on each square represent how many mines are adjacent to that square, including diagonals. Right click (Mouse2) to place an "M" where you think a mine is. Good Luck!</p>
      <DropdownButton class="dropdown-menu" id="dropdown-basic-button" title="Choose Difficulty">
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {this.switchGameMode(3,1, "Super Small")}}>Super Small (3x3, 1 mine)</Dropdown.Item>
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {this.switchGameMode(10, 10, "Small")}}>Small (10x10; 10 mines)</Dropdown.Item>
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {this.switchGameMode(20, 75, "Medium")}}>Medium (20x20; 75 mines)</Dropdown.Item>
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {this.switchGameMode(40, 300, "Large")}}>Large (40x40; 300 mines)</Dropdown.Item>
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {this.switchGameMode(15, 224, "Troll")}}>Troll (all mines except 1)</Dropdown.Item>
        <Dropdown.Item as="button" class="dropdown-item" onClick={() => {let size = parseInt(Math.random()*30); 
          this.switchGameMode(size, parseInt(Math.random()*(size*size/2)), "Random")}}>Random (random size, # mines)</Dropdown.Item>
      </DropdownButton>
      <div>Difficulty: {this.state.title}</div>
      <div>{minesLeft}</div>
      <div className="gameOver">{gameOver}</div>

      <div className="game">
      {grid}
      </div>
      <button onClick={()=>this.showMines()}>Show Mines</button>
      </>
      );
  }
}



ReactDOM.render(
  <React.StrictMode>
    <Board />
  </React.StrictMode>,
  document.getElementById('root')
);
