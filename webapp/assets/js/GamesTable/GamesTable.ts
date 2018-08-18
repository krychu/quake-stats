import { htmlToElement, setAttributeIfDifferent, setPropertyIfDifferent, roundString, roundPercentageString } from "../utils";
import './GamesTable.scss';

export class GamesTable extends HTMLElement {

  constructor() {
    super();
    console.log( "games table constructor" );
  }

  connectedCallback() {
    console.log( "games table connected callback" );
  }

  // private _shadowRoot;
  // private _player: string;
  // private _gameCnt: number = 10;

  // constructor() {
  //   super();
  //   //this._shadowRoot = this.attachShadow({ mode: "open" });
  //   //this._shadowRoot.appendChild( this._container );
  //   this._readPropertiesFromAttributes();

  //   // event listeners here
  // }

  // _readPropertiesFromAttributes(): void {
  //   let attrPlayer = this.getAttribute( "player" );
  //   attrPlayer = attrPlayer && attrPlayer.trim();
  //   if ( attrPlayer && attrPlayer !== this.player ) {
  //     this.player = attrPlayer;
  //   }

  //   const attrGameCnt = parseInt( this.getAttribute( "game-cnt" ) );
  //   if ( attrGameCnt > 0 && attrGameCnt != this.gameCnt) {
  //     this.gameCnt = attrGameCnt;
  //   }
  // }

  // get player(): string {
  //   return this._player;
  // }

  // set player( newPlayer: string ) {
  //   newPlayer = newPlayer && newPlayer.trim();
  //   setPropertyIfDifferent( this, "_player", newPlayer );
  //   setAttributeIfDifferent( this, "player", newPlayer );
  // }

  // get gameCnt(): number {
  //   return this._gameCnt;
  // }

  // set gameCnt( newCnt: number ) {
  //   // TODO: use setAttributeIfDifferent
  //   if ( this.gameCnt !== newCnt ) {
  //     this._gameCnt = newCnt;
  //     this.setAttribute( "game-cnt", "" + this._gameCnt );
  //   }
  // }

  // connectedCallback() {
  //   if ( !this.childElementCount) {
  //     this.appendChild( this._domCreateHeaderRow() );
  //   }

  //   this._recreateGames( this.player, this.gameCnt );
  // }

  // disconnectedCallback() {
  //   // ?
  // }

  // static get observedAttributes() {
  //   return [ "player", "game-cnt" ];
  // }

  // attributeChangedCallback( name, oldValue, newValue ) {
  //   this.player = newValue;
  //   this._recreateGames( this.player, this.gameCnt );
  // }

  // _recreateGames( player: string, gameCnt: number ): void {
  //   if ( !player || !player.length || this.gameCnt < 1 ) {
  //     return;
  //   }

  //   fetch( this._createURL( this.player, this.gameCnt ) )
  //     .then( (response) => response.text() )
  //     .then( (responseText) => {
  //       const json = JSON.parse( responseText );
  //       const games = this._domCreateGames( json );
  //       this._domRemoveGames();
  //       this._domAddGames( games );
  //     });
  // }

  // _createURL( player: string, gameCnt: number ): string {
  //   return `/api/${player}/games/${gameCnt}`;
  // }

  // _domAddGames( games: HTMLElement[] ): void {
  //   games.forEach( (e: HTMLElement) => {
  //     this.appendChild( e );
  //   })
  // }

  // _domCreateGames( json: any ): HTMLElement[] {
  //   const games: HTMLElement[] = [];

  //   json.forEach( ([a, b]: Array<any>) => {
  //     const s = `
  //     <div class="game-row">
  //       <div class="cell">${b.name}</div>
  //       <div class="cell">${a.map}</div>
  //       <div class="cell">
  //         ${a.frags} / ${b.frags}
  //       </div>
  //       <div class="cell">${ roundString(a.kd, 2) }</div>
  //       <div class="cell">${ roundString(a.dmg_gt, 2) }</div>
  //       <div class="cell">${ roundPercentageString(a.lg_acc, 1) }</div>
  //       <div class="cell">${ roundString(a.dmg_per_minute) }</div>
  //       <div class="cell">${a.ra}</div>
  //       <div class="cell">${ roundPercentageString(a.ra / ( a.ra + b.ra )) }</div>
  //     </div>
  //     `;
  //     games.push( htmlToElement( s ) );
  //   });

  //   return games;
  // }

  // _domCreateHeaderRow(): HTMLElement {
  //   const s = `
  //   <div class="header-row">
  //     <div class="cell">opponent</div>
  //     <div class="cell">map</div>
  //     <div class="cell">score</div>
  //     <div class="cell">K/D</div>
  //     <div class="cell">G/T</div>
  //     <div class="cell">LG%</div>
  //     <div class="cell">dmg/min</div>
  //     <div class="cell">ra</div>
  //   </div>
  //   `;

  //   return htmlToElement( s );
  // }

  // _domRemoveGames(): void {
  //   for ( let i = this.childElementCount - 1; i > 0; i-- ) {
  //     this.removeChild( this.children[ i ] );
  //   }
  // }

}

customElements.define( 'games-table', GamesTable );
