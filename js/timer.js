module.exports = {
  renderTime: function(since) {
    let diff = (+new Date - since)/1000;

    const hours   = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    if( hours ) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if( minutes ) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
