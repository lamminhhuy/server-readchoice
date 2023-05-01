
const Group = require('../models/groupModel');
const Post = require('../models/postModel')
const userModel= require('../models/userModel')
 const groupCtrl = {
     getGroups: async (req, res)=> {
        try {
            const groups = await Group.find().sort({ members: -1 });
            res.json(groups);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }   
     },
     getPosts: async (req, res)=> {
      try {
          const posts = await Post.find({group: req.params.groupId});
          res.json(posts);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }   
   },
     joinaGroup: async (req,res) => {
      try {
        const group = await Group.findById(req.params.groupId);
    
        // Check if group exists
        if (!group) {
          return res.status(404).json({ errors: [{ msg: 'Group not found' }] });
        }
    
        // Check if user is already a member of the group
        if (group.members.includes(req.user._id)) {
          return res.status(400).json({ errors: [{ msg: 'User is already a member of the group' }] });
        }
    
        // Add user to the group
        group.members.push(req.user._id);
    
        // Save changes
        await group.save();
    
        // Get the added member's information
        const member = await userModel.findById(req.user._id);
    
        res.json( member);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    },    
     getaGroup: async (req,res) => {
      try {
        const groupId = req.params.groupId;
        const group = await Group.findById(groupId).populate('members');
    
        if (!group) {
          return res.status(404).json({ message: 'Không tìm thấy nhóm' });
        }
    
        // Lấy danh sách bài viết của nhóm
        const posts = await Post.find({ group: groupId })
          .populate('book') // Thêm thông tin sách liên quan đến bài viết
          .populate('user') // Thêm thông tin người dùng đăng bài viết
          .exec();
  
        res.json({ group, posts });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin nhóm và bài viết' });
      }
    
    },
 createGroup: async (req,res) => {
    try {
        // Kiểm tra các trường thông tin tạo group
        if (!req.body.name) {
          return res.status(400).json({ message: 'Group name is required.' });
        }
        if (req.body.name.length > 100) {
          return res.status(400).json({ message: 'Group name cannot be more than 100 characters.' });
        }
        if (req.body.description && req.body.description.length > 1000) {
          return res.status(400).json({ message: 'Group description cannot be more than 1000 characters.' });
        }
        if (req.body.rules && req.body.rules.length > 500) {
            return res.status(400).json({ message: 'Group description cannot be more than 1000 characters.' });
          }
        if (!req.body.moderatorId) {
          return res.status(400).json({ message: 'Moderator ID is required.' });
        }
        const existingGroup = Group.findOne({name: req.body.name});
        if(existingGroup ==null)
        {
          return res.status(400).json({ message: 'The name group has been taken.' });
        }
        // Tạo một group mới
        const group = new Group({
          name: req.body.name,
          description: req.body.description,
          moderators: [req.body.moderatorId],
          members: [req.body.moderatorId],
          rules: req.body.rules,
        });
        // Lưu group mới vào database
        const savedGroup = await group.save();
        res.json(savedGroup);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
 }
}
module.exports =groupCtrl