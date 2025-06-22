class SlicingHelper {
  box = {};

  slice = (L, B, l, b, rotate) => {
    if (!rotate) {
      this.box.containersize = `${L},${B}`;
      this.box.fillersize = `${l},${b}`;
      this.box.occupied_L = Math.floor(L / l) * l;
      this.box.occupied_B = Math.floor(B / b) * b;
      this.box.occupied = `${this.box.occupied_L},${this.box.occupied_B}`;
      this.box.freeright_L = L - this.box.occupied_L;
      this.box.freeright_B = B;
      this.box.freeright = `${this.box.freeright_L},${this.box.freeright_B}`;
      this.box.freebottom_L = Math.floor(L / l) * l;
      this.box.freebottom_B = B - this.box.occupied_B;
      this.box.freebottom = `${this.box.freebottom_L},${this.box.freebottom_B}`;

      this.box.instance = Math.floor(L / l) * Math.floor(B / b);
      this.box.totalareausage = this.box.instance * (l * b);
      this.box.percentageused = (this.box.totalareausage / (L * B)) * 100;
    }
    if (rotate) {
      const swapper = L;
      L = B;
      B = swapper;

      this.box.containersize = `${L},${B}`;
      this.box.fillersize = `${l},${b}`;
      this.box.occupied_L = Math.floor(L / l) * l;
      this.box.occupied_B = Math.floor(B / b) * b;
      this.box.occupied = `${this.box.occupied_L},${this.box.occupied_B}`;
      this.box.freeright_L = L - this.box.occupied_L;
      this.box.freeright_B = B;
      this.box.freeright = `${this.box.freeright_L},${this.box.freeright_B}`;
      this.box.freebottom_L = Math.floor(L / l) * l;
      this.box.freebottom_B = B - this.box.occupied_B;
      this.box.freebottom = `${this.box.freebottom_L},${this.box.freebottom_B}`;

      this.box.instance = Math.floor(L / l) * Math.floor(B / b);
      this.box.totalareausage = this.box.instance * (l * b);
      this.box.percentageused = (this.box.totalareausage / (L * B)) * 100;
    }
  };

  propsIdentifier = (L, B, l, b, rotate, memo = {}) => {
    if (l > L || b > B) {
      memo.Rotate = rotate;
      memo.Status = false;
      return { memo };
    }
    memo.Rotate = rotate;
    memo.Status = true;
    this.slice(L, B, l, b, memo.Rotate);

    if ('efficiency' in memo) {
      const percentremaining = 100 - memo.efficiency;
      memo.efficiency += (percentremaining * this.box.percentageused) / 100;
    } else {
      memo.efficiency = (this.box.totalareausage / (L * B)) * 100;
    }

    if ('numbRecurr' in memo) {
      memo.numbRecurr += 1;
      memo.totalinstance += this.box.instance;
      memo[`slice${memo.numbRecurr}`] = {
        Size: this.box.containersize,
        Occupied: this.box.occupied,
        FreeBottom: this.box.freebottom,
        FreeRight: this.box.freeright,
        Box: this.box.instance,
      };
    } else {
      memo.numbRecurr = 1;
      memo.totalinstance = this.box.instance;
      memo[`slice${memo.numbRecurr}`] = {
        Size: this.box.containersize,
        Occupied: this.box.occupied,
        FreeBottom: this.box.freebottom,
        FreeRight: this.box.freeright,
        Box: this.box.instance,
      };
    }

    if (this.box.freeright_L >= b) {
      this.propsIdentifier(this.box.freeright_L, B, b, l, rotate, memo);
    }

    if (this.box.freebottom_B >= b) {
      this.propsIdentifier(this.box.freebottom_L, this.box.freebottom_B, b, l, rotate, memo);
    }

    return { memo };
  };
}

export const calcRectangle = (L, B, l, b) => {
  const helper = new SlicingHelper();
  return helper.propsIdentifier(L, B, l, b, false);
};
