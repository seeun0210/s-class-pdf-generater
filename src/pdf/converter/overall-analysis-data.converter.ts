import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import { OverallAnalysisData, OverallTemplateData } from './types';

@Injectable()
export class OverallAnalysisDataConverter
  implements DataConverter<OverallAnalysisData, OverallTemplateData>
{
  convert(data: OverallAnalysisData): OverallTemplateData {
    return {
      student_profile: {
        personality_type: data.studentProfile?.personalityType || '',
        learning_style: data.studentProfile?.learningStyle || '',
        motivation_type: data.studentProfile?.motivationType || '',
        career_orientation: data.studentProfile?.careerOrientation || '',
      },
      core_competencies:
        data.coreCompetencies?.map((competency) => ({
          competency_name: competency.competencyName || '',
          level: competency.level || 0,
          description: competency.description || '',
          evidence: competency.evidence || [],
        })) || [],
      growth_areas:
        data.growthAreas?.map((area) => ({
          area_name: area.areaName || '',
          current_level: area.currentLevel || 0,
          target_level: area.targetLevel || 0,
          description: area.description || '',
          action_items: area.actionItems || [],
        })) || [],
      recommendations:
        data.recommendations?.map((rec) => ({
          category: rec.category || '',
          title: rec.title || '',
          description: rec.description || '',
          priority: rec.priority || 0,
          action_steps: rec.actionSteps || [],
        })) || [],
      comprehensive_conclusion: {
        overall_assessment:
          data.comprehensiveConclusion?.overallAssessment || '',
        key_strengths: data.comprehensiveConclusion?.keyStrengths || [],
        development_areas: data.comprehensiveConclusion?.developmentAreas || [],
        future_direction: data.comprehensiveConclusion?.futureDirection || '',
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
