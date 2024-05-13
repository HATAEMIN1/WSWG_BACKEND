
reviewRouter.post("/", async (req, res) => {
    try {
      const { title, content, isLive, userId } = req.body;
  
      if (typeof title !== "string")
        res.status(400).send({ err: "title is required" });
      if (typeof content !== "string")
        res.status(400).send({ err: "content is required" });
      if (!mongoose.isValidObjectId(userId))
        res.status(400).send({ err: "userId is required" });
  
      let user = await User.findById(userId);
      if (!user) res.status(400).send({ err: "user does not" });
  
      // let blog = new Blog({...req.body,user})
      // await blog.save()
  
      let blog = await new Blog({ ...req.body, user }).save();
  
      return res.status(200).send({ blog });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
  });

  reviewRouter.get("/",async (req,res)=>{
    try {
        let {}
    }
  })