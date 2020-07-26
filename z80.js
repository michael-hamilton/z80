/*
 * Z80 CPU Emulator
 * © 2019 Michael Hamilton
 */

class z80 {
  constructor(memory) {
    this.registers = {
      a: 0x00,
      b: 0x00,
      c: 0x00,
      d: 0x00,
      e: 0x00,
      h: 0x00,
      l: 0x00,
      pc: 0x0000
    };

    this.busses = {
      data: 0x00,
      address: 0x0000
    };

    this.isReset = false;
    this.t = 0;
    this.m = 0;

    this.memory = memory;
  }

  reset() {
    this.registers.a = 0x00;
    this.registers.b = 0x00;
    this.registers.c = 0x00;
    this.registers.d = 0x00;
    this.registers.e = 0x00;
    this.registers.h = 0x00;
    this.registers.l = 0x00
    this.registers.pc = 0x0000;
    this.t = 0;
  }

  getRegisterState() {
    return this.registers;
  }

  getDataOnBus() {
    return this.busses.data;
  }

  getAddressOnBus() {
    return this.busses.address;
  }

  stepClock() {
    if (this.m === 0) {
      const opcode = this.readMemory(this.registers.pc);
      this.executeOpcode(opcode);
      this.registers.pc = this.registers.pc + 0x01
    }

    if (this.t < this.m -1) {
      this.t = this.t + 1;
    }
    else {
      this.t = 0
      this.m = 0;
    }
  }

  getT() {
    return this.t;
  }

  getM() {
    return this.m;
  }

  getPC() {
    return this.registers.pc;
  }

  readMemory(address) {
    return this.memory[address];
  }

  executeOpcode(opcode){
    // r is easier to type over and over
    const r = this.registers;

    switch(opcode) {

      // ld b,*
      case 0x06:
        this.m = 7;
        r.b = this.readMemory(r.pc);
        r.pc = r.pc + 0x02;
        break;

      // ld a(bc)
      case 0x0a:
        r.a = this.readMemory(r.b<<8 | r.c);
        break;

      // ld c,*
      case 0x0e:
        this.m = 7;
        r.c = this.readMemory(r.pc);
        r.pc = r.pc + 0x02;
        break;

      // ld a,b
      case 0x78:
        r.a = r.b;
        break;

      // ld a,c
      case 0x79:
        r.a = r.c;
        break;

      // ld a,d
      case 0x7a:
        r.a = r.d;
        break;

      // ld a,e
      case 0x7b:
        r.a = r.e;
        break;

      // ld a,h
      case 0x7c:
        r.a = r.h;
        break;

      // ld a,l
      case 0x7d:
        r.a = r.l;
        break;

      // ld a,a
      case 0x7e:
        r.a = r.a;
        break;

      // ld a,a
      case 0x7f:
        r.a = r.a;
        break;

      // add a,b
      case 0x80:
        r.a = r.a + r.b;
        break;

      // add a,c
      case 0x81:
        r.a = r.a + r.c;
        break;

      // add a,d
      case 0x82:
        r.a = r.a + r.d;
        break;

      // add a,e
      case 0x83:
        r.a = r.a + r.e;
        break;

      // add a,h
      case 0x84:
        r.a = r.a + r.h;
        break;

      // add a,l
      case 0x85:
        r.a = r.a + r.l;
        break;

      // add a,a
      case 0x87:
        r.a = r.a + r.a;
        break;

      // nop
      default:
        break;
    }
  }
}

export default z80;
