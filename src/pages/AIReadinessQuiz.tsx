import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Rocket, 
  Brain, 
  Trophy,
  CheckCircle2,
  Target,
  Zap,
  FileText,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { 
  introQuestions, 
  quizQuestions, 
  getPathRecommendations,
  type IntroQuestion,
  type QuizQuestion,
  type PathRecommendation
} from '@/data/ai-readiness-quiz';

type QuizStep = 'welcome' | 'intro' | 'quiz' | 'contact' | 'results';

interface UserProfile {
  name: string;
  email: string;
  age?: string;
  techLevel?: string;
  goal?: string;
  interests: string[];
  goalPoints: number;
}

interface Scores {
  ai: number;
  cognitive: number;
  risk: number;
  structure: number;
  time: number;
  total: number;
}

export default function AIReadinessQuiz() {
  const [step, setStep] = useState<QuizStep>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    interests: [],
    goalPoints: 0
  });
  const [introAnswers, setIntroAnswers] = useState<Record<string, string[]>>({});
  const [currentIntroIndex, setCurrentIntroIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({
    ai: 0,
    cognitive: 0,
    risk: 0,
    structure: 0,
    time: 0,
    total: 0
  });
  const [determinedPath, setDeterminedPath] = useState<PathRecommendation | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const filteredQuizQuestions = useMemo(() => {
    const age = userProfile.age;
    const techLevel = userProfile.techLevel;
    const goalPoints = userProfile.goalPoints;

    return quizQuestions.filter(q => {
      if (!q.conditionalDisplay) return true;

      const { techLevel: requiredTech, age: requiredAge, notAge } = q.conditionalDisplay;

      if (notAge && notAge.includes(age || '')) return false;
      
      if (requiredAge && age && !requiredAge.includes(age)) return false;

      if (requiredTech && techLevel) {
        if (!requiredTech.includes(techLevel)) return false;
        if (age === 'under15') return false;
        if (goalPoints < 2) return false;
      }

      return true;
    });
  }, [userProfile.age, userProfile.techLevel, userProfile.goalPoints]);

  const currentIntroQuestion = introQuestions[currentIntroIndex];
  const currentQuizQuestion = filteredQuizQuestions[currentQuizIndex];
  const totalQuizQuestions = filteredQuizQuestions.length;

  const getQuestionText = (question: QuizQuestion): string => {
    if (!question.questionVariants) return question.question;

    const age = userProfile.age;
    if (age === 'under15' && question.questionVariants.under15) {
      return question.questionVariants.under15;
    }
    if ((age === '26-40' || age === '41+') && question.questionVariants.age26Plus) {
      return question.questionVariants.age26Plus;
    }

    return question.question;
  };

  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('intro');
  };

  const handleIntroAnswer = (questionId: string, optionIds: string[]) => {
    setIntroAnswers(prev => ({
      ...prev,
      [questionId]: optionIds
    }));
  };

  const recomputeUserProfile = () => {
    let age: string | undefined;
    let techLevel: string | undefined;
    let goal: string | undefined;
    let interests: string[] = [];
    let goalPoints = 0;

    introQuestions.forEach(question => {
      const selectedOptions = introAnswers[question.id] || [];
      selectedOptions.forEach(optionId => {
        const option = question.options.find(o => o.id === optionId);
        if (option) {
          goalPoints += option.points;
          
          if (option.metadata?.age) {
            age = option.metadata.age;
          }
          if (option.metadata?.techLevel) {
            techLevel = option.metadata.techLevel;
          }
          if (option.metadata?.goal) {
            if (question.id === 'goal') {
              goal = option.metadata.goal;
            }
            if (question.id === 'interests' && !interests.includes(option.metadata.goal)) {
              interests.push(option.metadata.goal);
            }
          }
        }
      });
    });

    setUserProfile(prev => ({
      ...prev,
      age,
      techLevel,
      goal,
      interests,
      goalPoints
    }));
  };

  const handleIntroNext = () => {
    const currentQuestion = introQuestions[currentIntroIndex];
    const selectedOptions = introAnswers[currentQuestion.id] || [];

    if (selectedOptions.length === 0) return;

    recomputeUserProfile();

    if (currentIntroIndex < introQuestions.length - 1) {
      setCurrentIntroIndex(prev => prev + 1);
    } else {
      setStep('quiz');
    }
  };

  const handleIntroBack = () => {
    if (currentIntroIndex > 0) {
      recomputeUserProfile();
      setCurrentIntroIndex(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, optionIds: string[]) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIds
    }));
  };

  const handleQuizNext = () => {
    const currentQuestion = filteredQuizQuestions[currentQuizIndex];
    const selectedOptions = quizAnswers[currentQuestion.id] || [];

    if (selectedOptions.length === 0) return;

    if (currentQuizIndex < filteredQuizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setStep('contact');
    }
  };

  const handleQuizBack = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile.name && userProfile.email) {
      calculateScoresAndPath();
      setStep('results');
    }
  };

  const calculateScoresAndPath = () => {
    let aiScore = 0;
    let cogScore = 0;
    let riskScore = 0;
    let structureScore = 0;
    let timeScore = 0;

    filteredQuizQuestions.forEach(question => {
      const selectedOptions = quizAnswers[question.id] || [];
      selectedOptions.forEach(optionId => {
        const option = question.options.find(o => o.id === optionId);
        if (option?.scoreCategories) {
          aiScore += option.scoreCategories.ai || 0;
          cogScore += option.scoreCategories.cognitive || 0;
          riskScore += option.scoreCategories.risk || 0;
          structureScore += option.scoreCategories.structure || 0;
          timeScore += option.scoreCategories.time || 0;
        }
      });
    });

    if (userProfile.techLevel === 'pro') {
      aiScore += 10;
    }

    const totalScore = aiScore + cogScore + riskScore + structureScore + timeScore;

    setScores({
      ai: aiScore,
      cognitive: cogScore,
      risk: riskScore,
      structure: structureScore,
      time: timeScore,
      total: totalScore
    });

    let pathType: 'Entrepreneur' | 'Career' | 'Side Hustle' | 'Early Stage';
    
    if (riskScore >= 10 && (aiScore >= 25 || cogScore >= 28)) {
      pathType = 'Entrepreneur';
    } else if (structureScore >= 10 && cogScore >= 30) {
      pathType = 'Career';
    } else if (timeScore >= 10 && aiScore >= 20) {
      pathType = 'Side Hustle';
    } else {
      pathType = 'Early Stage';
    }

    const path = getPathRecommendations(pathType, userProfile.age, userProfile.techLevel);
    setDeterminedPath(path);
  };

  const progressPercentage = useMemo(() => {
    if (step === 'welcome') return 0;
    if (step === 'intro') {
      return ((currentIntroIndex + 1) / introQuestions.length) * 20;
    }
    if (step === 'quiz') {
      return 20 + ((currentQuizIndex + 1) / totalQuizQuestions) * 70;
    }
    if (step === 'contact') return 90;
    return 100;
  }, [step, currentIntroIndex, currentQuizIndex, totalQuizQuestions]);

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                Discover Your AI Earning Potential
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Take this 5-minute assessment to unlock your personalized AI skills report and see exactly how much you could earn.
              </p>
            </div>

            <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 border border-gradient-from/20 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-gradient-from mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">What you'll discover:</p>
                  <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Your AI Aptitude Score</li>
                    <li>Cognitive Skills Profile</li>
                    <li>Personalized Earning Potential Report</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleWelcomeSubmit}>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base"
                data-testid="button-start"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Takes 5 minutes • Get instant results • No credit card required
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'intro' && currentIntroQuestion) {
    const isMultiple = currentIntroQuestion.type === 'multiple';
    const maxSelections = currentIntroQuestion.maxSelections || 1;
    const selectedOptions = introAnswers[currentIntroQuestion.id] || [];
    const canProceed = selectedOptions.length > 0 && 
      (!isMultiple || selectedOptions.length <= maxSelections);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" data-testid="badge-progress">
                  Setup {currentIntroIndex + 1} of {introQuestions.length}
                </Badge>
                <span className="text-sm text-muted-foreground" data-testid="text-percentage">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
              <p className="text-sm text-muted-foreground">
                First, a few quick questions to customize your quiz experience
              </p>
            </div>
            <CardTitle className="text-2xl mt-6" data-testid="text-question">
              {currentIntroQuestion.question}
            </CardTitle>
            {isMultiple && (
              <CardDescription data-testid="text-instruction">
                Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isMultiple ? (
              <div className="space-y-3">
                {currentIntroQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    className="flex items-center space-x-3 p-4 rounded-md border hover-elevate cursor-pointer"
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (selectedOptions.length < maxSelections) {
                            handleIntroAnswer(currentIntroQuestion.id, [...selectedOptions, option.id]);
                          }
                        } else {
                          handleIntroAnswer(
                            currentIntroQuestion.id,
                            selectedOptions.filter(id => id !== option.id)
                          );
                        }
                      }}
                      data-testid={`checkbox-${option.id}`}
                    />
                    <span className="flex-1 text-base leading-relaxed">
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onValueChange={(value) => handleIntroAnswer(currentIntroQuestion.id, [value])}
              >
                <div className="space-y-3">
                  {currentIntroQuestion.options.map((option) => (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className="flex items-center space-x-3 p-4 rounded-md border hover-elevate cursor-pointer"
                    >
                      <RadioGroupItem value={option.id} id={option.id} data-testid={`radio-${option.id}`} />
                      <span className="flex-1 text-base leading-relaxed">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}

            <div className="flex gap-3 pt-4">
              {currentIntroIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handleIntroBack}
                  className="flex-1"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleIntroNext}
                disabled={!canProceed}
                className="flex-1 bg-gradient-to-r from-gradient-from to-gradient-to"
                data-testid="button-next"
              >
                {currentIntroIndex === introQuestions.length - 1 ? 'Start Quiz' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'quiz' && currentQuizQuestion) {
    const selectedOptions = quizAnswers[currentQuizQuestion.id] || [];
    const canProceed = selectedOptions.length > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" data-testid="badge-progress">
                  Question {currentQuizIndex + 1} of {totalQuizQuestions}
                </Badge>
                <span className="text-sm text-muted-foreground" data-testid="text-percentage">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              {currentQuizQuestion.category === 'AI Skills' && <Brain className="h-5 w-5 text-gradient-from" />}
              {currentQuizQuestion.category === 'Cognitive Skills' && <Target className="h-5 w-5 text-gradient-to" />}
              {currentQuizQuestion.category === 'Readiness Signals' && <Rocket className="h-5 w-5 text-gradient-from" />}
              <CardDescription data-testid="text-category">
                {currentQuizQuestion.category} • {currentQuizQuestion.section}
              </CardDescription>
            </div>
            <CardTitle className="text-2xl mt-4" data-testid="text-question">
              {getQuestionText(currentQuizQuestion)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedOptions[0] || ''}
              onValueChange={(value) => handleQuizAnswer(currentQuizQuestion.id, [value])}
            >
              <div className="space-y-3">
                {currentQuizQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    className="flex items-center space-x-3 p-4 rounded-md border hover-elevate cursor-pointer"
                  >
                    <RadioGroupItem value={option.id} id={option.id} data-testid={`radio-${option.id}`} />
                    <span className="flex-1 text-base leading-relaxed">
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleQuizBack}
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleQuizNext}
                disabled={!canProceed}
                className="flex-1 bg-gradient-to-r from-gradient-from to-gradient-to"
                data-testid="button-next"
              >
                {currentQuizIndex === totalQuizQuestions - 1 ? 'Almost Done!' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock Your Earning Potential Report</h2>
              <p className="text-muted-foreground">
                Enter your details to see your personalized AI skills assessment and income opportunities
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">What's your name?</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-2 h-12 text-base"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-medium">What's your email?</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-2 h-12 text-base"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base font-semibold"
                data-testid="button-see-results"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Get My Earning Potential Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'results' && determinedPath) {
    const percentageScore = Math.round((scores.total / (totalQuizQuestions * 10)) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-gradient-from/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2" data-testid="text-congrats">
                  Congratulations, {userProfile.name}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your AI Readiness Assessment is complete
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-md">
                  <div className="text-3xl font-bold text-gradient-from mb-1" data-testid="text-total-score">
                    {percentageScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-md">
                  <div className="text-3xl font-bold text-gradient-to mb-1" data-testid="text-ai-score">
                    {scores.ai}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Skills</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-md">
                  <div className="text-3xl font-bold text-gradient-from mb-1" data-testid="text-cognitive-score">
                    {scores.cognitive}
                  </div>
                  <div className="text-sm text-muted-foreground">Cognitive Skills</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gradient-from to-gradient-to p-6 rounded-md text-white mb-6">
                <h2 className="text-2xl font-bold mb-2" data-testid="text-path-title">
                  {determinedPath.title}
                </h2>
                <p className="opacity-90 mb-4" data-testid="text-path-description">
                  {determinedPath.description}
                </p>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-md p-4 mt-4">
                  <DollarSign className="h-6 w-6" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${determinedPath.earningPotential.min.toLocaleString()} - ${determinedPath.earningPotential.max.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90">{determinedPath.earningPotential.timeframe}</div>
                  </div>
                </div>
                <p className="text-sm opacity-90 mt-3">{determinedPath.earningPotential.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gradient-from" />
                  Recommended Projects
                </h3>
                <div className="grid gap-3">
                  {determinedPath.projects.map((project, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-md hover-elevate">
                      <CheckCircle2 className="h-5 w-5 text-gradient-from flex-shrink-0" />
                      <span data-testid={`text-project-${index}`}>{project}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-gradient-to" />
                  Your Next Steps
                </h3>
                <div className="grid gap-3">
                  {determinedPath.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gradient-from/20 to-gradient-to/20 flex-shrink-0">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <span data-testid={`text-step-${index}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full mt-6 h-12"
                onClick={() => setShowDetailedResults(!showDetailedResults)}
                data-testid="button-detailed-results"
              >
                <FileText className="mr-2 h-5 w-5" />
                {showDetailedResults ? 'Hide' : 'View'} Detailed Results
                {showDetailedResults ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
              </Button>

              <Button 
                className="w-full mt-4 bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base font-semibold"
                onClick={() => window.location.href = '/practice'}
                data-testid="button-explore"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Join the AI Skills Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Start learning today and unlock your earning potential
              </p>
            </CardContent>
          </Card>

          {showDetailedResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Question Breakdown</CardTitle>
                <CardDescription>
                  Review your answers and see how you scored on each question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredQuizQuestions.map((question, index) => {
                  const userAnswerId = quizAnswers[question.id]?.[0];
                  const userAnswer = question.options.find(o => o.id === userAnswerId);
                  const bestAnswer = question.options.reduce((best, current) => 
                    current.points > best.points ? current : best
                  , question.options[0]);
                  
                  const points = userAnswer?.points || 0;
                  const isCorrect = points === 10;
                  const isPartial = points > 0 && points < 10;
                  const isWrong = points === 0;

                  return (
                    <div 
                      key={question.id} 
                      className="p-4 border rounded-md space-y-3"
                      data-testid={`question-breakdown-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="shrink-0">
                          Q{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{getQuestionText(question)}</p>
                          <div className="text-sm text-muted-foreground mb-1">
                            {question.category} • {question.section}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isCorrect && (
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Perfect
                            </Badge>
                          )}
                          {isPartial && (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Partial
                            </Badge>
                          )}
                          {isWrong && (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Missed
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pl-11">
                        <div className={`p-3 rounded-md border-l-4 ${
                          isCorrect ? 'bg-green-500/5 border-l-green-500' :
                          isPartial ? 'bg-amber-500/5 border-l-amber-500' :
                          'bg-red-500/5 border-l-red-500'
                        }`}>
                          <div className="text-sm font-medium mb-1">Your Answer ({points} pts)</div>
                          <div className="text-sm">{userAnswer?.text || 'No answer selected'}</div>
                        </div>

                        {!isCorrect && (
                          <div className="p-3 rounded-md border-l-4 bg-gradient-to-br from-gradient-from/5 to-gradient-to/5 border-l-gradient-from">
                            <div className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-gradient-from" />
                              Best Answer ({bestAnswer.points} pts)
                            </div>
                            <div className="text-sm">{bestAnswer.text}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
