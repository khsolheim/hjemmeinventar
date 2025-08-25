import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const learningRouter = createTRPCRouter({
  // Get knowledge base
  getKnowledgeBase: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get knowledge base data
        const totalArticles = 156
        const articles = [
          {
            id: 'article-1',
            title: 'Home Organization Basics',
            description: 'Learn the fundamentals of home organization',
            category: 'Organization',
            readTime: 5,
            status: 'read'
          },
          {
            id: 'article-2',
            title: 'Digital Inventory Management',
            description: 'How to manage your inventory digitally',
            category: 'Technology',
            readTime: 8,
            status: 'unread'
          },
          {
            id: 'article-3',
            title: 'Minimalist Living Guide',
            description: 'Embrace minimalism in your home',
            category: 'Lifestyle',
            readTime: 12,
            status: 'unread'
          },
          {
            id: 'article-4',
            title: 'Smart Home Integration',
            description: 'Integrate smart devices with your inventory',
            category: 'Technology',
            readTime: 10,
            status: 'unread'
          },
          {
            id: 'article-5',
            title: 'Sustainable Storage Solutions',
            description: 'Eco-friendly storage and organization tips',
            category: 'Sustainability',
            readTime: 7,
            status: 'unread'
          }
        ]

        const categories = [
          {
            id: 'category-1',
            name: 'Organization',
            articleCount: 45,
            icon: 'BookOpen'
          },
          {
            id: 'category-2',
            name: 'Technology',
            articleCount: 32,
            icon: 'Smartphone'
          },
          {
            id: 'category-3',
            name: 'Lifestyle',
            articleCount: 28,
            icon: 'Heart'
          },
          {
            id: 'category-4',
            name: 'Sustainability',
            articleCount: 23,
            icon: 'Leaf'
          }
        ]

        return {
          totalArticles,
          articles,
          categories
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente knowledge base'
        })
      }
    }),

  // Get skills development
  getSkillsDevelopment: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get skills data
        const totalSkills = 8
        const skills = [
          {
            id: 'skill-1',
            name: 'Organization',
            description: 'Home organization and decluttering',
            level: 85
          },
          {
            id: 'skill-2',
            name: 'Digital Management',
            description: 'Digital inventory and asset management',
            level: 72
          },
          {
            id: 'skill-3',
            name: 'Minimalism',
            description: 'Minimalist lifestyle and practices',
            level: 65
          },
          {
            id: 'skill-4',
            name: 'Smart Home',
            description: 'Smart home technology integration',
            level: 58
          },
          {
            id: 'skill-5',
            name: 'Sustainability',
            description: 'Sustainable living and eco-friendly practices',
            level: 45
          }
        ]

        const skillsAnalytics = [
          {
            id: 'analytics-1',
            name: 'Average Skill Level',
            value: '65%',
            icon: 'BarChart3'
          },
          {
            id: 'analytics-2',
            name: 'Skills Improved',
            value: '3',
            icon: 'TrendingUp'
          },
          {
            id: 'analytics-3',
            name: 'Learning Streak',
            value: '12 days',
            icon: 'Calendar'
          },
          {
            id: 'analytics-4',
            name: 'Time Invested',
            value: '45h',
            icon: 'Clock'
          }
        ]

        return {
          totalSkills,
          skills,
          skillsAnalytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente skills development'
        })
      }
    }),

  // Get educational content
  getEducationalContent: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get educational content data
        const completedCourses = 5
        const courses = [
          {
            id: 'course-1',
            title: 'Home Organization Masterclass',
            description: 'Complete guide to organizing your home',
            duration: '2 hours',
            lessons: 12,
            completed: true
          },
          {
            id: 'course-2',
            title: 'Digital Inventory Management',
            description: 'Learn to manage inventory digitally',
            duration: '1.5 hours',
            lessons: 8,
            completed: true
          },
          {
            id: 'course-3',
            title: 'Minimalist Living Workshop',
            description: 'Embrace minimalism in your daily life',
            duration: '3 hours',
            lessons: 15,
            completed: false
          },
          {
            id: 'course-4',
            title: 'Smart Home Setup Guide',
            description: 'Set up and integrate smart home devices',
            duration: '2.5 hours',
            lessons: 10,
            completed: false
          },
          {
            id: 'course-5',
            title: 'Sustainable Living Practices',
            description: 'Adopt eco-friendly living habits',
            duration: '1.8 hours',
            lessons: 9,
            completed: false
          }
        ]

        const contentAnalytics = [
          {
            id: 'analytics-1',
            name: 'Course Completion Rate',
            value: '40%',
            percentage: 40
          },
          {
            id: 'analytics-2',
            name: 'Average Study Time',
            value: '25 min/day',
            percentage: 75
          },
          {
            id: 'analytics-3',
            name: 'Knowledge Retention',
            value: '78%',
            percentage: 78
          },
          {
            id: 'analytics-4',
            name: 'Learning Satisfaction',
            value: '92%',
            percentage: 92
          }
        ]

        return {
          completedCourses,
          courses,
          contentAnalytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente educational content'
        })
      }
    }),

  // Get learning settings
  getLearningSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get learning settings
        const learningScore = 78
        const settings = [
          {
            id: 'learning-enabled',
            key: 'learningEnabled',
            name: 'Learning System',
            enabled: true,
            icon: 'BookOpen'
          },
          {
            id: 'skills-tracking',
            key: 'skillsTracking',
            name: 'Skills Tracking',
            enabled: true,
            icon: 'GraduationCap'
          },
          {
            id: 'content-recommendations',
            key: 'contentRecommendations',
            name: 'Content Recommendations',
            enabled: true,
            icon: 'Lightbulb'
          },
          {
            id: 'progress-notifications',
            key: 'progressNotifications',
            name: 'Progress Notifications',
            enabled: true,
            icon: 'Bell'
          },
          {
            id: 'adaptive-learning',
            key: 'adaptiveLearning',
            name: 'Adaptive Learning',
            enabled: true,
            icon: 'Target'
          },
          {
            id: 'learning-analytics',
            key: 'learningAnalytics',
            name: 'Learning Analytics',
            enabled: true,
            icon: 'BarChart3'
          }
        ]

        const preferences = [
          {
            id: 'learning-pace',
            name: 'Learning Pace',
            value: 'Moderate',
            percentage: 70
          },
          {
            id: 'content-preference',
            name: 'Content Preference',
            value: 'Video + Text',
            percentage: 85
          },
          {
            id: 'study-frequency',
            name: 'Study Frequency',
            value: 'Daily',
            percentage: 90
          },
          {
            id: 'skill-focus',
            name: 'Skill Focus',
            value: 'Organization',
            percentage: 65
          }
        ]

        return {
          learningScore,
          settings,
          preferences
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente learning settings'
        })
      }
    }),

  // Start learning
  startLearning: protectedProcedure
    .input(z.object({
      courseId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { courseId } = input

        // Start learning
        const result = {
          success: true,
          courseId,
          timestamp: new Date(),
          status: 'Started'
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'LEARNING_STARTED',
            description: 'Learning started',
            userId,
            metadata: {
              courseId: result.courseId,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke starte learning'
        })
      }
    }),

  // Complete course
  completeCourse: protectedProcedure
    .input(z.object({
      courseId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { courseId } = input

        // Complete course
        const result = {
          success: true,
          courseId,
          timestamp: new Date(),
          status: 'Completed'
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'COURSE_COMPLETED',
            description: 'Course completed',
            userId,
            metadata: {
              courseId: result.courseId,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke fullføre course'
        })
      }
    }),

  // Update skill
  updateSkill: protectedProcedure
    .input(z.object({
      skillId: z.string(),
      level: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { skillId, level } = input

        // Update skill
        const result = {
          success: true,
          skillId,
          newLevel: level,
          timestamp: new Date(),
          improvement: level > 0
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'SKILL_UPDATED',
            description: 'Skill updated',
            userId,
            metadata: {
              skillId: result.skillId,
              newLevel: result.newLevel,
              improvement: result.improvement
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere skill'
        })
      }
    }),

  // Update learning settings
  updateSettings: protectedProcedure
    .input(z.object({
      learningEnabled: z.boolean().optional(),
      skillsTracking: z.boolean().optional(),
      contentRecommendations: z.boolean().optional(),
      progressNotifications: z.boolean().optional(),
      adaptiveLearning: z.boolean().optional(),
      learningAnalytics: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Update learning settings
        const result = {
          success: true,
          updatedSettings: input,
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'LEARNING_SETTINGS_UPDATED',
            description: 'Learning settings updated',
            userId,
            metadata: {
              updatedSettings: input
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere learning settings'
        })
      }
    }),

  // Get learning statistics
  getLearningStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get learning statistics
        const [courses, skills, articles, settings] = await Promise.all([
          ctx.db.activity.count({
            where: {
              userId,
              type: 'COURSE_COMPLETED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'SKILL_UPDATED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'ARTICLE_READ'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'LEARNING_SETTINGS_UPDATED'
            }
          })
        ])

        return {
          totalCoursesCompleted: courses,
          totalSkillsUpdated: skills,
          totalArticlesRead: articles,
          totalSettingsUpdates: settings
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente learning statistikk'
        })
      }
    })
})
