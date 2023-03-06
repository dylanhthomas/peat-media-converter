/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const ipc = require('electron').ipcRenderer
const fs = require('@supercharge/fs')
const $ = require('jquery')
const shell = require('electron').shell


const process = require('child_process')
var randomString = require('random-string');
var ffmpeg = require('ffmpeg-static-electron');

// console.log(ffmpeg.path);



const button = document.getElementById("upload")
var format = "videoFull"

button.addEventListener('click', function(event) {
    format = $("input[name='format']:checked").val();
    console.log("format: " + format)
    console.log("button clicked")
    ipc.send("open-file-dialog-for-file")
})

ipc.on('selected-file', function(event, paths) {
    console.log(event)
    console.log(paths)

    var subdir = 'converter_output'
    var dir = fs.dirname(paths) + "\\" + subdir

    // console.log(dir)

    if (!fs.existsSync(dir)) {
        console.log("making dir")
        fs.mkdirSync(dir)
        console.log("made it")

    }
    var randomid = randomString()


    $('#info').append(`
        <div id="${randomid}" class="padding-xs color-white background-info">${paths} is converting. Please wait. <div class="space-xl spinner spinner-xl"></div></div>
    `)

    var basename = fs.filename(paths)

    console.log("basename: " + basename)


    var convert_command = ""
    var output_filename = ""
    var shell_filename = ""


    if (format == "videoBasic" || format == "animatedGIF" ) {
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
    }

    else {
        output_filename = `${dir}\\${basename}_converted_000.avi`
        var safe_filename = !fs.existsSync(output_filename)
        console.log("safe filename: " + safe_filename)
        shell_filename = output_filename
        output_pattern = `${dir}\\${basename}_converted_%03d.avi`

        let index = 1

        while (safe_filename == false) {
            output_filename = `${dir}\\${basename}_(${index})_converted_000.avi`
            safe_filename = !fs.existsSync(output_filename)
            console.log("output filename: " + output_filename)
            console.log("safe filename: " + safe_filename)
            shell_filename = output_filename
            output_pattern = `${dir}\\${basename}_(${index})_converted_%03d.avi`
            index = index + 1
        }


    }


    var command_base = `${ffmpeg.path} -i "${paths}" -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error`
    // var command_base = `${ffmpeg.path} -i "${paths}" -an -vcodec rawvideo -y -r 25`

    switch (format) {
        case "animatedGIF":
            convert_command = `${command_base} -pix_fmt yuv420p "${output_filename}"`
            break;
        case "videoFull":
            convert_command = `${command_base} -vf "scale='min(640,iw)':-1" -map 0 -segment_time 00:03:00 -f segment -reset_timestamps 1 "${output_pattern}"`
            break;
        case "videoBasic":
            convert_command = `${command_base} "${output_filename}"`
            break;
        default:
            alert('should not ever get here')
            break;
    }

    console.log("convert command: " + convert_command)
    console.log("output file: " + output_filename)
    console.log("shell file: " + shell_filename)

    process.exec(convert_command, function(error, stdout, stderr) {
        console.log(stdout)
        console.log(stderr)

        $(`#${randomid}`).detach()

        $('#info').append(`
            <div class="padding-xs color-white background-success margin-vertical-xs">${paths} is finished converting.</div>
        `)

        shell.showItemInFolder(shell_filename);

        if (error != null)
            console.log(error)
    })

})