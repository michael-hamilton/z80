import React, { Component } from 'react';
import z80 from '../z80';
import './debugger.scss';

const dec2hex = (i) => {
  let result = "0000";
  if      (i >= 0    && i <= 15)    { result = "000" + i.toString(16); }
  else if (i >= 16   && i <= 255)   { result = "00"  + i.toString(16); }
  else if (i >= 256  && i <= 4095)  { result = "0"   + i.toString(16); }
  else if (i >= 4096 && i <= 65535) { result =         i.toString(16); }
  return result
}

const nbspPad = (string, pad = 2) => string.padStart(pad, " ").replace(/ /g, "\u00a0");

const ControlButton = props => (
  <button onClick={props.onClick} className={props.active ? 'active' : null} disabled={props.disabled}>
    { props.label }
  </button>
);

const ValueList = props => (
  Object.keys(props.items).map(item => (
    <li key={item} className='monospace value-list-item'>
      {nbspPad(item)} - {props.hex ? dec2hex(props.items[item]) : props.items[item]}
    </li>
  ))
);

export default class Debugger extends Component {
  constructor(props) {
    super(props);

    // Just for testing
    this.memory = [
      0x06, 0x01, 0x01, 0x0e, 0x01, 0x01, 0x00, 0x00,
      0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ];

    this.state = {
      cpu: new z80(this.memory),
      cycles: 0,
      clock: {
        running: false,
        interval: null,
        rate: 5,
      },
      memory: this.memory
    };
  }

  stepClock() {
    this.state.cpu.stepClock();
    this.setState({
      cycles: this.state.cycles + 1
    });
    this.forceUpdate();
  }

  changeClockRate(rate) {
    this.setState({
      clock: {
        ...this.state.clock,
        rate,
      }
    })
  }

  resetCpu() {
    this.setState({cycles: 0})
    this.state.cpu.reset();
    this.forceUpdate();
  }

  toggleClock(rate) {
    if(!this.state.clock.running) {
      const interval = setInterval(() => {
        this.stepClock();
      }, 1000/this.state.clock.rate);
      this.setState({
        clock: {
          ...this.state.clock,
          interval,
          running: true
        }
      });
    }
    else {
      clearInterval(this.state.clock.interval);
      this.setState({
        clock: {
          ...this.state.clock,
          running: false
        }
      });
    }
  }

  renderMemoryContents(pc) {
    let currentCol = 0;
    const renderContent = [];
    const row = [];
    let currentAddress = 0;
    this.memory.forEach((value, address) => {
      if(currentCol < 8) {
        row.push(value);
        currentCol++;
      }
      else {
        renderContent.push(
          <tr key={address}>
            {
              row.map((rowValue, index) => {
                currentAddress++;
                return (
                  <td className='monospace'>
                    <span className={pc === currentAddress ? 'active' : null}>
                      {dec2hex(rowValue).toUpperCase()}
                    </span>
                  </td>
                );
              })
            }
          </tr>
        );
        currentCol=0;
        row.length=0;
      }
    });
    return renderContent;
  }

  render() {
    return (
      <div>
        <div className='header'>
          <h1>z80 Debugger</h1>
        </div>

        <div className='debugger'>
          <div className='controls'>
            <div className='control-section'>
              <ControlButton onClick={() => this.resetCpu()} label="Reset" />
            </div>

            <div className='control-section'>
              <ControlButton
                onClick={() => this.stepClock()}
                label="Single Step"
                disabled={this.state.clock.running}
              />
            </div>

            <div className='control-section'>
                <ControlButton
                  onClick={() => this.toggleClock()}
                  label={this.state.clock.running ? 'Stop Clock' : 'Start Clock'}
                  active={this.state.clock.running}
                />
                <div className='slider'>
                  <input disabled={this.state.clock.running} type="range" min="1" max="25" value={this.state.clock.rate} className="slider" onChange={(e) => this.changeClockRate(e.target.value)} />
                  <span>{this.state.clock.rate}hz</span>
                </div>
                <p>Total cycles - {this.state.cycles}</p>
            </div>
          </div>

          <div className='cpuStateWrapper'>
            <div>
              <h3>CPU</h3>
              <ul>
                <ValueList items={{t: this.state.cpu.getT(), m: this.state.cpu.getM()}} />
              </ul>
            </div>

            <div>
              <h3>Registers</h3>
              <ul>
                <ValueList items={this.state.cpu.getRegisterState()} hex />
              </ul>
            </div>

            <div>
              <h3>Memory</h3>
              <table><tbody>{this.renderMemoryContents(this.state.cpu.getPC())}</tbody></table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
