package calc

import "testing"

func TestCompute(t *testing.T) {
	tests := []struct {
		name      string
		left      float64
		right     float64
		op        string
		want      float64
		wantError error
	}{
		{name: "sum", left: 2, right: 3, op: "+", want: 5},
		{name: "sub", left: 7, right: 2, op: "-", want: 5},
		{name: "mul", left: 4, right: 2.5, op: "*", want: 10},
		{name: "div", left: 10, right: 4, op: "/", want: 2.5},
		{name: "square", left: 6, right: 0, op: "square", want: 36},
		{name: "sqrt", left: 9, right: 0, op: "sqrt", want: 3},
		{name: "div by zero", left: 10, right: 0, op: "/", wantError: ErrDivisionByZero},
		{name: "sqrt of negative number", left: -4, right: 0, op: "sqrt", wantError: ErrNegativeSqrtInput},
		{name: "unknown op", left: 1, right: 1, op: "^", wantError: ErrInvalidOperator},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Compute(tt.left, tt.right, tt.op)
			if tt.wantError != nil {
				if err != tt.wantError {
					t.Fatalf("expected error %v, got %v", tt.wantError, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got != tt.want {
				t.Fatalf("expected %v, got %v", tt.want, got)
			}
		})
	}
}
