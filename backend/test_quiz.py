from app.services.generation import QuizGenerator

# Test the quiz generator
generator = QuizGenerator()

try:
    result = generator.generate_without_rag("Ancient Rome", 2)
    print("SUCCESS!")
    print(result)
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
