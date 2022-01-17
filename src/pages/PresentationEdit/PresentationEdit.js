import React, { useState, useRef, useEffect } from 'react'
import './style.css'

const PresentationEdit = () => {
    // Elements References
    const inputRef = useRef(null);
    const dragAreaRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const selectedElemRef = useRef(null) // Selected Box Reference
    // useEffect is used to make references after page load
    useEffect(() => {
        const canvas = canvasRef.current
        contextRef.current = canvas.getContext("2d")
    }, [])
    // States to show or hide components
    const [showCanvas, setshowCanvas] = useState(false);
    const [image, setimage] = useState(false);
    const [isEdit, setisEdit] = useState(false);
    const [showTxtSettings, setshowTxtSettings] = useState(false)
    // HERE IS OUR IMAGE AND TEXT STYLINGS
    // Default Styling Values
    const defaultEdits = { //image filters
        brightness: 0,
        contrast: 0,
        blur: 0,
        saturate: 0,
        hue: 0
    }
    const defaultTextStyles = { //if text has no styles, it will be Use
        fontSize: 18,
        color: "#ffffff",
        fontWeight: 600,
        bold: "normal",
        italic: "normal",
    };
    // Saving  it to state
    const [editInfo, seteditInfo] = useState(defaultEdits) //image Filters
    const [textStyles, settextStyles] = useState(defaultTextStyles) //text styles like bold etc
    const { color, fontSize, bold, italic } = textStyles


    const adjustListItems = [
        { name: "brightness" },
        { name: "contrast" },
        { name: "blur", min: 0, max: 30 },
        { name: "saturate" },
        { name: "hue", }
    ]

    //  FOR IMAGE

    const imageHandler = (e) => { // Render Image On Canvas
        const ctx = contextRef.current
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageFile = e.target ? e.target.files[0] : e //works if target is undefined ImageHandler also called from dropped File where (e) will file
        const image = new Image()
        image.src = URL.createObjectURL(imageFile)
        if (imageFile) {
            image.onload = () => {
                seteditInfo(defaultEdits)
                setshowCanvas(true)
                draw(image)
            }
            setimage(image)
        }
    }

    // This function Draws an image
    function draw(img) {
        const canvas = canvasRef.current
        // get the scaleF
        var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        // get the top left position of the image
        var x = (canvas.width / 2) - (img.width / 2) * scale;
        var y = (canvas.height / 2) - (img.height / 2) * scale;
        // To Center an image in canvas
        contextRef.current.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    // Here Is Our Dropping Function (Image Or SideBar Text)
    useEffect(() => { //here is also used UseEffect hook to make references after page load
        const dragArea = dragAreaRef.current
        // if user drags file over in this area
        dragArea.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (!image) { dragArea.classList.add("active"); }
        })
        // if leave dragged file from this area
        dragArea.addEventListener('dragleave', (e) => {
            e.preventDefault()
            dragArea.classList.remove("active")
        })
        dragArea.addEventListener('drop', (e) => {
            e.preventDefault()
            dragArea.classList.remove("active")
            const file = e.dataTransfer.files[0] //in DataTranfer , files is Array we've used [0] to get first itemFile from array even if user selects Multiple
            // To Drop a file
            if (file) {
                const fileType = file.type
                var allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
                if (allowedExtension.includes(fileType.split('/')[1])) {  //split is used because the type of file will be like image/jpeg 
                    imageHandler(file)
                }
            } else { addTextBox() }
        })
    }, []);

    // It will set Image editting's informtions to above State named as editInfo
    const editHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        seteditInfo({ ...editInfo, [name]: value })
        setisEdit(true)
    }
    // It Will Call Canvas with Filters
    useEffect(() => {
        const { brightness, contrast, blur, saturate, hue } = editInfo
        contextRef.current.filter = `
        brightness(${+brightness + 100}%) contrast(${+contrast + 100}%) blur(${+blur}px) saturate(${+saturate + 100}%) hue-rotate(${+hue / 100 * 360}deg)`
        if (image) { draw(image) }
    }, [editInfo])
    // Reset All Changes
    const resetEdit = () => {
        contextRef.current.filter = "none"
        contextRef.current.clearRect(0, 0, 600, 600)
        if (image) { draw(image) }
        setisEdit(false)
        seteditInfo(defaultEdits)
        removeAllTextBoxes()
    }

    // FOR TEXT 
    // it will save text stylings to state
    const textStylesHandler = (e) => {
        let name = e.target.name
        let value = e.target.value
        if (name === "bold" || name === "italic") {
            value = (e.target.checked && name) || "normal"
        }
        settextStyles({ ...textStyles, [name]: value })

    }
    // Draw Text On Canvas
    const textHandler = (elem) => {
        const ctx = contextRef.current
        let { x, y } = elem.savedPositions
        const text = elem.value //text
        // Getting styles
        const { fontSize, color, bold, italic } = defaultTextStyles
        const fntSize = elem.style.fontSize || fontSize
        const clr = elem.style.color || color
        const bld = elem.style.fontWeight || bold
        const itlc = elem.style.fontStyle || italic
        // Applying Styles
        ctx.font = `${bld} ${itlc} ${fntSize} Arial`
        ctx.fillStyle = clr
        ctx.fillText(text, x + 3, (y + 11 + parseInt(fntSize))); //Adding Padding and border's difference in px
    }
    // This functions is Trigerred onFocus it will show text settings Section
    const textFocused = (e) => {
        selectedElemRef.current = e.target // Make selected Reference
        setshowTxtSettings(true)
        selectedElemRef.current.style.border = "dashed" //To Highlight
        selectedElemRef.current.style.margin = "initial"
    }
    // It is Only For Displaying Properties To Text Box like bold , color..
    const displayEditsToText = () => {
        // If user Change in any edits it will apply to textBox
        const element = selectedElemRef.current
        element.style.fontSize = fontSize + 'px'
        element.style.color = color //it is converting into rgb and input does'nt work with it
        element.style.colour = color //To save it in default Hexa values
        element.style.fontWeight = bold
        element.style.fontStyle = italic
    }
    const displayElementsPropertiesToScreen = () => {
        // Setting changes of States because text Settings Section has last Element Properties
        if (selectedElemRef.current) {
            const styles = selectedElemRef.current.style
            const fntSize = styles.fontSize || fontSize
            const clr = styles.colour || color
            const fontWeight = styles.fontWeight || bold
            const fontStyle = styles.fontStyle || italic
            settextStyles({
                ...textStyles,
                styles,
                fontSize: parseInt(fntSize),
                color: clr,
                bold: fontWeight,
                italic: fontStyle,
            })
        }
    }
    // If any Change then call displayEditsToText()
    useEffect(() => {
        if (selectedElemRef.current) { displayEditsToText() }
    }, [textStyles])

    // Here Is The Text Box We were talking about it is temp Box (Can be Edit , Drag Or Remove)
    const addTextBox = () => {
        let anyChange = false
        let canvasDiv = dragAreaRef.current.childNodes[0]
        // Making an input Element
        const input = document.createElement("input");
        input.className = "textInput"
        input.spellcheck = false
        input.value = "Your Text"
        // Appending inside first div of dragArea
        canvasDiv.appendChild(input);
        // Adding Functions to every element
        setTimeout(() => input.focus(), 0) //Added timeout to run it asynchronously
        input.onfocus = (e) => { textFocused(e); displayElementsPropertiesToScreen() } // If User Focus , user can see it's properties
        input.onchange = () => anyChange = true
        input.focus() // focused with on Focus Function
        // hides Text Highlighted when user clicks on other area
        dragAreaRef.current.onclick = hideTextBox
        // If User remove focus without any change , the box will be deleted
        input.onblur = (e) => {
            const { offsetLeft: x, offsetTop: y } = e.target
            let position = { x, y }
            e.target.savedPositions = position
            if (!anyChange) {
                removeElement(canvasDiv, input)
            } else { setisEdit(true) }
        };
        // To Drag an element where Mouse moves
        const startDrag = () => {
            document.onmousemove = ({ movementX, movementY }) => {
                const { top, left } = window.getComputedStyle(input)
                input.style.top = `${parseInt(top) + movementY}px`
                input.style.left = `${parseInt(left) + movementX}px`
            }
            document.onmouseup = () => document.onmousemove = null // clearing function
        }
        input.onmousedown = startDrag // calling funtion
    }

    // Hides Text Box
    const hideTextBox = (e) => {
        const selectedElem = selectedElemRef.current
        if (!e.target.isEqualNode(selectedElem)) {
            setshowTxtSettings(false)
            if (selectedElem) {
                selectedElem.style.border = "0px"
                selectedElem.style.margin = "3px"
            }
        }
    }
    // to Selected Current Text box
    const removeCurrentTextBox = () => {
        if (selectedElemRef.current) {
            removeElement(dragAreaRef.current.childNodes[0], selectedElemRef.current)
            selectedElemRef.current = null
        }
    }
    // To delete an element
    const removeElement = (parent, element) => {
        parent.removeChild(element)
        setshowTxtSettings(false)
    }
    // RemeveAllText Boxes 
    const removeAllTextBoxes = () => {
        let canvasScreen = dragAreaRef.current.childNodes[0]
        let textBoxes = canvasScreen.querySelectorAll(".textInput")
        textBoxes.forEach((elem) => {
            textHandler(elem)
            canvasScreen.removeChild(elem)
        })
    }
    // it will merge text with canvas before downloading
    const mergeTxtWithCanvas = () => {
        let canvasScreen = dragAreaRef.current.childNodes[0]
        let textBoxes = canvasScreen.querySelectorAll(".textInput")
        textBoxes.forEach((elem) => {
            textHandler(elem) // text will send to text handler to merge
            removeElement(canvasScreen, elem)
        })
    }
    // Finallly Download it !
    const downloadCanvasAsImage = () => {
        mergeTxtWithCanvas()
        const link = canvasRef.current.toDataURL("image/jpg")
        const a = document.createElement("a")
        a.href = link
        a.download = "download"
        document.body.appendChild(a); a.click()
        document.body.removeChild(a)
    }
    return (
        <>
            <div className="navbar">Presentation Edit</div>

            <div className='image-editor-warapper'>
                {/* Input Area */}
                <div className="tools">
                    <label htmlFor="imageFile" className="toolItem">
                        <input ref={inputRef} type="file" id="imageFile" hidden onChange={imageHandler} />
                        Image
                    </label>
                    <div className={`toolItem ${!showCanvas && "disabled"}`} draggable={true} onClick={addTextBox}>Text</div>
                </div>

                {/* Main Screen Area */}
                <div ref={dragAreaRef} className="canvasScreen dragArea">
                    <div className={`cParent ${!showCanvas ? 'hidden' : "fadeToRight"}`}>
                        <canvas ref={canvasRef} width={"600"} height={"600"} />
                    </div>
                    <div className={`imageUpload ${showCanvas && 'hidden'}`} onClick={() => inputRef.current.click()}>
                        <div>Drag Or Upload your own Images</div>
                        <button>Open Image File</button>
                    </div>
                </div>

                {/* Editing Area */}
                <div className="styleBar">
                    {
                        showCanvas && !showTxtSettings ?
                            <>
                                <div className="adjust" >
                                    <div className='editingSection'>
                                        <div className="editingHeading">Adjust</div>
                                        {
                                            adjustListItems.map((obj) => {
                                                const { name, min, max } = obj
                                                const value = editInfo[name] || 0
                                                return (
                                                    <div className="adjustItem" key={name}>
                                                        <div className='adjustHdng'><span>{name}</span> <span>{value}</span></div>
                                                        <input className='slider' min={!isNaN(min) ? min : -100} max={max || 100} name={name} type="range" value={value} onChange={editHandler} />
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className={`buttons ${!isEdit && "disabled"}`}>
                                        <button onClick={resetEdit}>Reset</button>
                                        <button style={{ background: '#00a323' }} onClick={downloadCanvasAsImage}>Download</button>
                                    </div>
                                </div>
                            </>
                            : ''
                    }
                    {
                        showTxtSettings ?
                            <div className="textSettings">
                                <div className="textHdng">Text Styles</div>
                                <div className="styleItem">
                                    <div className="option">Font Size : </div><div className="value">
                                        <input type="number" name='fontSize' value={fontSize} min={0} max={200} onChange={textStylesHandler} /> px
                                    </div>
                                </div>
                                <div className="styleItem">
                                    <div className="option">Color : </div><div className="value">
                                        <input type="color" name="color" value={color} onChange={textStylesHandler} />
                                    </div>
                                </div>
                                <div className="styleItem">
                                    <label htmlFor='bold' className="fontStyles">Bold : <input type="checkbox" id='bold' name='bold' checked={bold === "bold"} onChange={textStylesHandler} /></label>
                                    <label htmlFor='italic' className="fontStyles">Italic : <input type="checkbox" id='italic' name='italic' checked={italic === "italic"} onChange={textStylesHandler} /></label>
                                </div>
                                <div className="dltButton" onClick={removeCurrentTextBox}>
                                    <button>Delete</button>
                                </div>
                            </div> : ""
                    }

                </div>
            </div>
        </>
    )
}
export default PresentationEdit