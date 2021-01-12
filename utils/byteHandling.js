const intToUint8Array = (x) => {
  var bytes = [];
  var i = 8;
  do {
    bytes[--i] = x & 255;
    x = x >> 8;
  } while (i);
  return new Uint8Array(bytes);
};

const intFromBytes = (x) => {
  var val = 0;
  for (var i = 0; i < x.length; ++i) {
    val += x[i];
    if (i < x.length - 1) {
      val = val << 8;
    }
  }
  return val;
};

module.exports = {
  intToUint8Array,
  intFromBytes
};
