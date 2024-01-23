# 3D - CONVERSATIONAL GIS

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Conventions](#conventions)
- [Usage](#usage)
- [Technologies Used](#tech_used)

## About <a name = "about"></a>

<!-- The "CONVERSATIONAL GIS" project introduces an innovative, web-based 3D Earth system, changing the way how we explore our planet. By merging the visual splendor of a detailed 3D Earth model with the interactive capabilities of OpenAI's ChatGPT, this system offers an immersive storytelling experience, enabling users to interact with geographical data conversationally. Users can inquire about specific locations, manipulate camera angles, toggle between rendering modes, and access a wealth of map information, all through natural language dialogue and GUI via text and panels. 

This approach aims to make geographical exploration more informative, engaging, and accessible to a broad audience without requiring specialized hardware. -->

## TODOs: 
- Modify pane's positions to have a better fit
- Separate the scripts for audiomanager, panes behaviour, and interactions with the gpt
- Add a big info pane that can be hidden or triggered on command.
- Change between maps on command.
- Add the recording buttons to one of the panes.

## Getting Started <a name = "getting_started"></a>

<!-- These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system. -->

### Prerequisites

<!-- What things you need to install the software and how to install them.

```
Give examples
``` -->

### Installing

<!-- A step by step series of examples that tell you how to get a development env running.

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo. -->

### Technologies Used <a name = "tech_used"></a>

- NPM -> Needs to install , probs I can build the production version which could be somehow fast? 
- PARCEL -> For managing libraries and resources within our project.
- FLASK -> For the backend part.  
- THREE JS -> For the rendering part, probs building mine could be useful in the future for version 2 (?)
- TWEAKPANE -> To use panes and build the GUI - TODO
- ORBITCONTROLS.js -> Addon from THREE, where we can manipulate the camera.

### Conventions <a name = "conventions"></a>

I'll add some conventions for simplicity and organization during the development.

## 1. Use // for all comments, including multi-line comments
## 2. Negated boolean variable names should be avoided
## 3. Names for methods or functions must be verbs and written in CamelCase starting with lower case
## 4.  The prefix n should be used for variables representing a number of objects
## 5. The prefix i should be used for variables representing an entity number