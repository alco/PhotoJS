/*
***
 * *** Description ***
 * Inside each top level group in the document, save each layer into a PNG file (non-recursively).
 * Name each PNG file according to this pattern: GROUP_NAME-LAYER_NAME.png.
 *
 * *** Usage ***
 * save-groups.jsx FILENAME OUTPUT_DIR [IGNORE_INVISIBLE]
 *
 * *** Arguments ***
 *   FILENAME
 *       name of the PSD file to work with
 *
 *   OUTPUT_DIR
 *       name of the directory to place resulting files in
 *
 *   IGNORE_INVISIBLE
 *       skip (don't save) invisible layers (true by default)
***
*/


// Parse arguments
if (arguments.length < 2) {
    throw("Usage: save-groups.jsx FILENAME OUTPUT_DIR [IGNORE_VISIBLE]");
}
var layoutFilename = arguments[0];
var outputDirectory = arguments[1];
var ignoreInvisible = (arguments.length > 2 ? arguments[2] : true);


// Execute script
var docRef = openFileSafely(layoutFilename);

// Create the output directory if it does not exist
var folderRef = new Folder(outputDirectory);
folderRef.create();

filterTopLevelGroups(docRef, function(layerSetRef) {
    saveLayerSet(layerSetRef, ignoreInvisible);
});

docRef.close(SaveOptions.DONOTSAVECHANGES);


// *** Function definitions ***

function saveLayerSet(layerSetRef, ignoreInvisible)
  /* Save all layers under the specified set */
{
    for (var i = 0; i < layerSetRef.artLayers.length; ++i) {
        var layerRef = layerSetRef.artLayers[i];
        if (ignoreInvisible && !layerRef.visible)
            continue;
        saveLayer(layerRef);
    }
}

function saveLayer(layerRef)
  /* Save the contents of layerRef into a PNG file */
{
    var layerName = layerRef.name;
    var groupName = layerRef.parent.name;
    var bounds = layerRef.bounds;

    // Create an empty layer below layerRef and merge into it
    // (basically, this rasterizes the layer)
    var emptyLayerRef = layerRef.parent.artLayers.add();
    emptyLayerRef.move(layerRef, ElementPlacement.PLACEAFTER);
    var newLayerRef = layerRef.merge();

    // Copy layer contents into pasteboard
    newLayerRef.copy();

    // Create a new document to paste our layer into
    var width = bounds[2] - bounds[0];
    var height = bounds[3] - bounds[1];
    var resolution = 72;
    app.documents.add(width, height, resolution, layerName,
                      NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, BitsPerChannelType.EIGHT);
    var newDocRef = app.activeDocument;

    newDocRef.paste();

    // Probably redundant?
    newDocRef.trim(TrimType.TRANSPARENT);

    // Save the new document as a PNG file and close it
    var pngSaveOptions = new PNGSaveOptions();
    pngFile = new File(outputDirectory + "/" + groupName + "-" + layerName + ".png");
    newDocRef.saveAs(pngFile, pngSaveOptions, true, Extension.LOWERCASE);
    newDocRef.close(SaveOptions.DONOTSAVECHANGES);
}


// *** Utility functions ***

function openFileSafely(path)
  /* First, check if the document specified by 'path' is already open.
   *
   * If it is, duplicate it in its current state and return a reference
   * to the newly created document.
   *
   * Otherwise, open the document in the usual way and return a
   * reference to it.
   */
{
    var openedDoc;
    for (var i = 0; i < app.documents.length; ++i) {
        var doc = app.documents[i];
        if (File(path).fullName == doc.fullName) {
            openedDoc = doc;
            break;
        }
    }

    if (openedDoc) {
        // Duplicate the document providing a supposedly unique name for
        // its copy
        return openedDoc.duplicate(openedDoc.name
                                   + "--gen##major_Evil Darth Schneider");
    } else {
        var fileRef = File(path);
        return app.open(fileRef);
    }
}

function filterTopLevelGroups(docRef, filter)
  /* Apply filter -- a function taking one argument -- to each top level
   * group.
   */
{
    for (var i = 0; i < docRef.layerSets.length; ++i) {
        var layerSetRef = docRef.layerSets[i];
        filter(layerSetRef);
    }
}
