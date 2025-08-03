module.exports = {
  packagerConfig: {
    // asar: true, // or an object containing your asar options
    "extraResource": [
      "./_UDATA"
    ]
  },
  ignore: [".idea",".circleci",".gitignore","UDATA",'client/ui/src','logs','node_modules','*.bat'],
  plugins: [
    // {
    //   name: '@electron-forge/plugin-auto-unpack-natives',
    //   config: {}
    // }
  ],
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin','win32'],
      config: {
        authors: 'fvn'
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        authors: 'fvn'
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        authors: 'fvn'
      },
    },
  ],
};
