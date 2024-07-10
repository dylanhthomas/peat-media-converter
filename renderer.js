/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window.
 * Node.js APIs are available in this process because `nodeIntegration` is 
 * enabled and `contextIsolation` is turned off in `main.js`.
 * TODO: Investigate changing to contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const ipc = require('electron').ipcRenderer
const fs = require('@supercharge/fs')
const $ = require('jquery')
const shell = require('electron').shell

const process = require('child_process')
var randomString = require('random-string');
// var ffmpeg = require('ffmpeg-static-electron');
// console.log(ffmpeg.path);

const ffmpeg = __dirname + "\\bin\\ffmpeg.exe"
const ffss =  __dirname + "\\bin\\ffss.exe"

const button = document.getElementById("upload")

// Set default conversion format
var format = "videoFull"

button.addEventListener('click', function(event) {
    format = $("input[name='format']:checked").val();
    console.log("format: " + format)
    console.log("button clicked")
    ipc.send("open-file-dialog-for-file")
})

ipc.on('selected-file', function(event, paths) {
    // console.log(event)
    console.log(paths)

    // Set name for output directory
    var subdir = 'converter_output'
    // Construct path of output directory, as a subdirectory of the input file path
    var dir = fs.dirname(paths) + "\\" + subdir


    // If the output directory does not exist, create it
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    // Create random string, to be used for notices
    var randomid = randomString()


    $('#info').append(`
        <div id="${randomid}" class="padding-xs color-white background-info">${paths} is converting. Please wait. <div class="space-xl spinner spinner-xl"></div></div>
    `)


    var basename = fs.filename(paths)

    // console.log("basename: " + basename)


    var convert_command = ""
    var output_filename = ""
    var shell_filename = ""


    output_filename = `${dir}\\${basename}_converted.avi`
    var safe_filename = !fs.existsSync(output_filename)
    console.log("safe filename: " + safe_filename)
    shell_filename = output_filename


    let index = 1;

    while (safe_filename == false) {
        output_filename = `${dir}\\${basename}_(${index})_converted.avi`
        safe_filename = !fs.existsSync(output_filename)
        console.log("output filename: " + output_filename)
        console.log("safe filename: " + safe_filename)
        shell_filename = output_filename
        index = index + 1
    }

    // FFMPEG conversion command with shared options
    /*
        -i                  input file
        -an                 discard audio
        -vcodec rawvideo    rencode video as raw, uncompressed
        -y                  overwrite any files with same name in output directory
        -r 25               set framerate as 25 frames per second
        -hidebanner         hide ffmpeg info in console
        -loglever error     only output errors to console

    */
    // var command_base = `${ffmpeg.path} -i "${paths}" -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error`
    var command_base = `"${ffmpeg}" -i "${paths}" -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error`

    switch (format) {
        case "animatedGIF":
            convert_command = `${command_base} -pix_fmt yuv420p "${output_filename}"`
            break;

            // FFMPEG options
            /*
                -pix_fmt yuv420p    encode using video pixels

            */

        case "videoFull":
            convert_command = `${command_base} -vf scale='min(640,iw)':-1 "${output_filename}" && "${ffss}" "${output_filename}" 1000000000 "${dir}"`

            break;

            // FFMPEG options
            /*
                -vf "scale='min(640,iw)':-1"    if video is larger than 640 pixels wide, scale it down to 640 pixels wide and automatic height, maintaining aspect ratio.
            
            */
            // FFSS options
            /*
                "[OUTPUT]_converted.avi"        input file
                1000000000                      size limit (1,000,000,000 bytes)
                "converter_output"              output directory
            */

        case "videoBasic":
            convert_command = `${command_base} "${output_filename}"`
            break;
        default:
            alert('should not ever get here')
            break;
    }

    // console.log("convert command: " + convert_command)
    // console.log("output file: " + output_filename)
    // console.log("shell file: " + shell_filename)

    process.exec(convert_command, {'shell':'cmd.exe'}, function(error, stdout, stderr) {
        console.log(error)
        console.log(stdout)
        console.log(stderr)

        // Remove the "In Progress" message, based on the random id assigned earlier
        $(`#${randomid}`).detach()

        $('#info').append(`
            <div class="padding-xs color-white background-success margin-vertical-xs">${paths} is finished converting.</div>
        `)

        // After conversion, open the output folder with the video file selected
        shell.showItemInFolder(shell_filename);

        if (error != null)
            alert(error)
    })

})