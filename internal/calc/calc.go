package calc

import (
	"errors"
	"math"
)

var (
	ErrInvalidOperator   = errors.New("invalid operator")
	ErrDivisionByZero    = errors.New("division by zero")
	ErrNegativeSqrtInput = errors.New("cannot calculate square root of a negative number")
)

func Compute(left, right float64, op string) (float64, error) {
	switch op {
	case "+":
		return left + right, nil
	case "-":
		return left - right, nil
	case "*":
		return left * right, nil
	case "/":
		if right == 0 {
			return 0, ErrDivisionByZero
		}
		return left / right, nil
	case "square":
		return left * left, nil
	case "sqrt":
		if left < 0 {
			return 0, ErrNegativeSqrtInput
		}
		return math.Sqrt(left), nil
	default:
		return 0, ErrInvalidOperator
	}
}
