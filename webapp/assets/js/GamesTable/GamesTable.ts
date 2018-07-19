import { htmlToElement, setAttributeIfDifferent, setPropertyIfDifferent } from "../utils";

export class GamesTable extends HTMLElement {

  private _shadowRoot;
  private _container: HTMLElement;
  private _player: string;
  private _gameCnt: number = 10;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._container = this._domCreateContainer();
    this._shadowRoot.appendChild( this._container );

    this._readPropertiesFromAttributes();

    // event listeners here
  }

  _readPropertiesFromAttributes(): void {
    let attrPlayer = this.getAttribute( "player" );
    attrPlayer = attrPlayer && attrPlayer.trim();
    if ( attrPlayer && attrPlayer !== this.player ) {
      this.player = attrPlayer;
    }

    const attrGameCnt = parseInt( this.getAttribute( "game-cnt" ) );
    if ( attrGameCnt > 0 && attrGameCnt != this.gameCnt) {
      this.gameCnt = attrGameCnt;
    }
  }

  get player(): string {
    return this._player;
  }

  set player( newPlayer: string ) {
    newPlayer = newPlayer && newPlayer.trim();
    setPropertyIfDifferent( this, "_player", newPlayer );
    setAttributeIfDifferent( this, "player", newPlayer );
  }

  get gameCnt(): number {
    return this._gameCnt;
  }

  set gameCnt( newCnt: number ) {
    if ( this.gameCnt !== newCnt ) {
      this._gameCnt = newCnt;
      this.setAttribute( "game-cnt", "" + this._gameCnt );
    }
  }

  connectedCallback() {
    this._recreate( this.player, this.gameCnt );
  }

  disconnectedCallback() {
    // ?
  }

  static get observedAttributes() {
    return [ "player", "game-cnt" ];
  }

  attributeChangedCallback( name, oldValue, newValue ) {
    console.log("1");
    this.player = newValue;
    this._recreate( this.player, this.gameCnt );
  }

  _recreate( player: string, gameCnt: number ): void {
    if ( !player || !player.length || this.gameCnt < 1 ) {
      return;
    }

    fetch( this._createURL( this.player, this.gameCnt ) )
      .then( (response) => response.text() )
      .then( (responseText) => {
        const json = JSON.parse( responseText );
        const games = this._domCreateGames( json );
        this._domRemoveGames( this._container );
        this._domAddGames( games, this._container );
      });
  }

  _createURL( player: string, gameCnt: number ): string {
    return `/api/${player}/games/${gameCnt}`;
  }

  _domAddGames( games: HTMLElement[], container: HTMLElement ): void {
    games.forEach( (e: HTMLElement) => {
      container.appendChild( e );
    })
  }

  _domCreateGames( json: any ): HTMLElement[] {
    const games: HTMLElement[] = [];

    json.forEach( ([a, b]: Array<any>) => {
      const s = `
<div class="recent-games-row">
  <div class="recent-games-cell">${b.name}</div>
  <div class="recent-games-cell">${a.map}</div>
  <div class="recent-games-cell">${a.frags} / ${b.frags}</div>
  <div class="recent-games-cell">${a.kd}</div>
  <div class="recent-games-cell">${a.dmg_gt}</div>
  <div class="recent-games-cell">${a.lg_acc}</div>
  <div class="recent-games-cell">${a.dmg_per_minute}</div>
  <div class="recent-games-cell">${a.ra}</div>
  <div class="recent-games-cell">${a.ra / ( a.ra + b.ra )}</div>
</div>
`;
      games.push( htmlToElement( s ) );
    });

    return games;
  }

  _domCreateContainer(): HTMLElement {
    const s = `
<div class="recent-games">
  <div class="recent-games-header">
    <div class="recent-games-header-cell">opponent</div>
    <div class="recent-games-header-cell">map</div>
    <div class="recent-games-header-cell">score</div>
    <div class="recent-games-header-cell">K/D</div>
    <div class="recent-games-header-cell">G/T</div>
    <div class="recent-games-header-cell">LG%</div>
    <div class="recent-games-header-cell">dmg/min</div>
    <div class="recent-games-header-cell">ra</div>
  </div>
</div>
`;

    return htmlToElement( s );
  }

  _domRemoveGames( container: HTMLElement ): void {
    while ( container.firstChild ) {
      container.removeChild( container.firstChild );
    }
  }

}

customElements.define( 'games-table', GamesTable );
