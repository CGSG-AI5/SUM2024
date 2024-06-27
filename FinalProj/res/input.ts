class InPut {
  Keys: number[];
  KeysClick: number[];
  Mx: number;
  My: number;
  Mz: number;
  Mdx: number;
  Mdy: number;
  Mdz: number;

  MouseClickLeft: number;
  MouseClickRight: number;

  constructor(MouseClick: number[], Keys: number[]) {
    this.Keys = this.KeysClick = Keys;
    this.Mx = this.My = this.Mz = this.Mdx = this.Mdy = this.Mdz = 0;
    this.MouseClickLeft = MouseClick[0];
    this.MouseClickRight = MouseClick[1];
  }

  response(
    M: number[],
    Md: number[],
    MouseClick: number[],
    Wheel: number,
    Keys: number[]
  ) {
    // if (Keys[17] != 0)

    for (let i = 0; i < 256; i++) {
      this.KeysClick[i] = Keys[i] && !this.Keys[i] ? 1 : 0;
    }
    for (let i = 0; i < 256; i++) {
      this.Keys[i] = Keys[i];
    }

    this.Mdx = Md[0];
    this.Mdy = Md[1];

    this.Mx = M[0];
    this.My = M[1];

    // this.Mx = M[0];
    // this.My = M[1];
    this.Mdz = Wheel;
    this.Mz += Wheel;

    this.MouseClickLeft = MouseClick[0];
    this.MouseClickRight = MouseClick[1];
  }
} // End of 'Input' function

export let myInput = new InPut([0, 0], []);
