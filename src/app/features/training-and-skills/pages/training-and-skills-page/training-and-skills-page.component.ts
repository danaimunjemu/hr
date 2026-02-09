import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-training-and-skills-page',
  standalone: false,
  templateUrl: './training-and-skills-page.component.html',
  styleUrl: './training-and-skills-page.component.scss'
})
export class TrainingAndSkillsPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  activeCourses = [
    {
      title: 'Advanced Angular Patterns',
      instructor: 'Dan Wahlin',
      completed: 65,
      dueDate: '2026-03-01'
    },
    {
      title: 'Cybersecurity Awareness',
      instructor: 'Security Team',
      completed: 20,
      dueDate: '2026-02-28'
    },
    {
      title: 'Effective Leadership',
      instructor: 'Simon Sinek',
      completed: 90,
      dueDate: '2026-02-15'
    }
  ];

  recommendedCourses = [
    {
      title: 'Introduction to GraphQL',
      description: 'Learn how to query data efficiently with GraphQL.',
      duration: '4h 30m',
      category: 'Development',
      thumbnail: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    {
      title: 'Conflict Resolution',
      description: 'Strategies for managing workplace conflict.',
      duration: '2h 15m',
      category: 'Soft Skills',
      thumbnail: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    }
  ];

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }
}
