function proxyParser (proxy) {
  if (typeof proxy == "string"){
    proxy = proxy.trim();
  }
  if (proxy && proxy !== "direct://") {
    if (typeof proxy !== "string") {
      throw new Error("proxy must be a string")
    }

    try {
      let protocol = proxy.split("://")
      if (protocol[1]) {
        proxy = protocol[1]
        protocol = protocol.shift()
      } else {
        proxy = protocol[0]
        protocol = "http"
      }

      if (proxy.includes("@")) {
        proxy = `${protocol}://${proxy}`
      } else {
        let points = proxy.split(":")
        if (points.length == 4) {
          proxy = `${protocol}://${points[2]}:${points[3]}@${points[0]}:${points[1]}`
        } else {
          proxy = `${protocol}://${points[0]}:${points[1]}`
        }
      }
    } catch (err) {
      throw new Error(err)
    }
  }
  return proxy
}

module.exports={
  proxyParser
}
