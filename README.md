# SpaceX Simulator Autopilot

This repo is a fun project to make an auto-pilot for the SpaceX project.

Initially I only took one try to pass the simulation manually, but it took me 4 hours to write an application which is
able to pass this challenge.

## Usage

To use this project on the official [simulator website](https://iss-sim.spacex.com/) you just have to copy the sources
from the [main.js](/main.js) and paste it to your developer console.
Pasting the code to the console also creates a new button at the bottom center of the screen which allows you to toggle
the auto pilot.

This will actually not do anything yet, except start the loop. To enable the actual auto-pilot, you have to call the 
`autopilot()` function. This method is a toggle, so you can just call it again to disable the auto-pilot again.

You can move the ship to any reasonable position before enabling the autopilot. Just make sure you're not too close to
the ISS.

Enjoy :P