import React, { Component } from 'react';
import z80 from '../src/z80';
import styles from './debugger.scss';

const ControlButton = props => <p><button onClick={props.onClick} >{ props.label }</button>{props.value ? ` - ${ props.value }` : ``}</p>;

const ValueList = props => Object.keys(props.items).map(item => <li key={item}>{item} - 0x{props.items[item].toString(16)}</li>)

export default class Debugger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cpu: new z80(),
      cycles: 0,
      clock: {
        running: false,
        interval: null
      }
    }
  }

  stepClock() {
    this.state.cpu.stepClock();
    this.setState({
      cycles: this.state.cycles + 1
    })
  }

  resetCpu() {
    this.state.cpu.reset();
    this.forceUpdate();
  }

  toggleClock() {
    if(!this.state.clock.running) {
      const interval = setInterval(() => {
        this.stepClock();
      }, 1000);
      this.setState({
        clock: {
          interval,
          running: true
        }
      });
    }
    else {
      clearInterval(this.state.clock.interval);
      this.setState({
        clock: {
          running: false
        }
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Debugger</h1>
        <ControlButton onClick={() => this.stepClock()} label="Cycle" value={`Total cycles - ${this.state.cycles}`}/>
        <ControlButton onClick={() => this.toggleClock()} label="Toggle" value={`Clock - ${this.state.clock.running}`}/>
        <ControlButton onClick={() => this.resetCpu()} label="Reset" />
        <div className='cpuStateWrapper'>
          <h3>CPU</h3>
          <p>t  - { this.state.cpu.getT() }</p>

          <h3>Registers</h3>
          <ul>
            <ValueList items={this.state.cpu.getRegisterState()}/>
          </ul>
        </div>
      </div>
    );
  }
}