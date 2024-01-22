function generate2DArray(rows: number, cols: number,fillval) {
    let arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols).fill(fillval);
    }
    return arr;
}