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
        return openedDoc.duplicate(openedDoc.name + "--gen##major_Evil Darth Schneider");
    } else {
        var fileRef = File(path);
        return app.open(fileRef);
    }
}
